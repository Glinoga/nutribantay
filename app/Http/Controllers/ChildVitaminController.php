<?php

namespace App\Http\Controllers;

use App\Jobs\RefreshDashboardForBarangay;
use App\Models\Child;
use App\Models\ChildVitamin;
use App\Models\ChildVitaminDose;
use App\Models\HealthLog;
use App\Models\Vitamin;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ChildVitaminController extends Controller
{
    public function index(Child $child)
    {
        $user = auth()->user();

        if ($child->barangay !== $user->barangay) {
            abort(403);
        }

        $childVitamins = ChildVitamin::where('child_id', $child->id)
            ->with(['vitamin', 'doses.administeredBy:id,name'])
            ->orderBy('created_at', 'desc')
            ->get();

        $availableVitamins = Vitamin::whereNotIn(
            'id',
            $childVitamins->pluck('vitamin_id')
        )->orderBy('name')->get();

        return Inertia::render('Children/Vitamins', [
            'child' => [
                'id' => $child->id,
                'slug' => $child->slug,
                'fullname' => $child->fullname,
                'barangay' => $child->barangay,
            ],
            'child_vitamins' => $childVitamins->map(fn ($cv) => [
                'id' => $cv->id,
                'vitamin' => $cv->vitamin,
                'progress' => $cv->progress,
                'doses' => $cv->doses->map(fn ($dose) => [
                    'id' => $dose->id,
                    'dose_number' => $dose->dose_number,
                    'date_given' => $dose->date_given?->format('Y-m-d'),
                    'next_due_date' => $dose->next_due_date?->format('Y-m-d'),
                    'remarks' => $dose->remarks,
                    'dose_status' => $dose->dose_status,
                    'administered_by' => $dose->administeredBy?->name,
                ]),
            ]),
            'available_vitamins' => $availableVitamins->map(fn ($v) => [
                'id' => $v->id,
                'name' => $v->name,
            ]),
        ]);
    }

    public function store(Request $request, Child $child)
    {
        $user = auth()->user();

        if ($child->barangay !== $user->barangay) {
            abort(403);
        }

        $child->abortIfOveraged();

        $request->validate([
            'vitamin_id' => 'required|exists:vitamins,id',
        ]);

        try {
            ChildVitamin::create([
                'child_id' => $child->id,
                'vitamin_id' => $request->vitamin_id,
            ]);
        } catch (QueryException $e) {
            if ($e->getCode() === '23000') {
                return back()->with('error', 'Vitamin is already assigned to this child.');
            }
            throw $e;
        }

        RefreshDashboardForBarangay::dispatch($child->barangay)
            ->delay(now()->addSeconds(10));

        return back()->with('success', 'Vitamin added to child.');
    }

    public function destroy(Child $child, ChildVitamin $childVitamin)
    {
        $user = auth()->user();

        if ($child->barangay !== $user->barangay) {
            abort(403);
        }

        $child->abortIfOveraged();

        if ($childVitamin->child_id !== $child->id) {
            abort(404);
        }

        $childVitamin->delete();

        RefreshDashboardForBarangay::dispatch($child->barangay)
            ->delay(now()->addSeconds(10));

        return back()->with('success', 'Vitamin removed from child.');
    }

    public function recordDose(Request $request, Child $child, ChildVitamin $childVitamin)
    {
        $user = auth()->user();

        if ($child->barangay !== $user->barangay) {
            abort(403);
        }

        $child->abortIfOveraged();

        if ($childVitamin->child_id !== $child->id) {
            abort(404);
        }

        $request->validate([
            'dose_number' => 'required|integer|min:1',
            'date_given' => 'nullable|date',
            'next_due_date' => 'nullable|date',
            'remarks' => 'nullable|string|max:1000',
        ]);

        $doseNumber = (int) $request->dose_number;

        [$existing, $dose] = DB::transaction(function () use ($childVitamin, $doseNumber, $request, $user) {
            $existing = ChildVitaminDose::where('child_vitamin_id', $childVitamin->id)
                ->where('dose_number', $doseNumber)
                ->lockForUpdate()
                ->first();

            if ($existing) {
                return [$existing, null];
            }

            $dose = ChildVitaminDose::create([
                'child_vitamin_id' => $childVitamin->id,
                'dose_number' => $doseNumber,
                'date_given' => $request->date_given ?: null,
                'next_due_date' => $request->next_due_date ?: null,
                'remarks' => $request->remarks,
                'administered_by' => $user->id,
            ]);

            return [null, $dose];
        });

        if ($existing) {
            return back()->withErrors(['dose_number' => 'Dose #'.$doseNumber.' already exists for this vitamin.']);
        }

        RefreshDashboardForBarangay::dispatch($child->barangay)
            ->delay(now()->addSeconds(10));

        return back()->with('success', 'Dose recorded successfully.');
    }

    public function updateDose(Request $request, Child $child, ChildVitamin $childVitamin, ChildVitaminDose $dose)
    {
        $user = auth()->user();

        if ($child->barangay !== $user->barangay) {
            abort(403);
        }

        $child->abortIfOveraged();

        if ($childVitamin->child_id !== $child->id) {
            abort(404);
        }

        if ($dose->child_vitamin_id !== $childVitamin->id) {
            abort(404);
        }

        $request->validate([
            'date_given' => 'nullable|date',
            'next_due_date' => 'nullable|date',
            'remarks' => 'nullable|string|max:1000',
        ]);

        $dose->update([
            'date_given' => $request->date_given ? $request->date_given : null,
            'next_due_date' => $request->next_due_date ? $request->next_due_date : null,
            'remarks' => $request->remarks,
        ]);

        RefreshDashboardForBarangay::dispatch($child->barangay)
            ->delay(now()->addSeconds(10));

        return back()->with('success', 'Dose updated successfully.');
    }

    public function destroyDose(Child $child, ChildVitamin $childVitamin, ChildVitaminDose $dose)
    {
        $user = auth()->user();

        if ($child->barangay !== $user->barangay) {
            abort(403);
        }

        $child->abortIfOveraged();

        if ($childVitamin->child_id !== $child->id) {
            abort(404);
        }

        if ($dose->child_vitamin_id !== $childVitamin->id) {
            abort(404);
        }

        // Uncheck vitamin_a on the originating health log if this dose was created from one
        if ($dose->healthlog_id) {
            HealthLog::where('id', $dose->healthlog_id)
                ->where('vitamin_a', true)
                ->update(['vitamin_a' => false]);
        }

        $dose->delete();

        RefreshDashboardForBarangay::dispatch($child->barangay)
            ->delay(now()->addSeconds(10));

        return back()->with('success', 'Dose deleted.');
    }
}
