<?php

namespace App\Http\Controllers;

use App\Jobs\RefreshDashboardForBarangay;
use App\Models\Child;
use App\Models\ChildVaccine;
use App\Models\ChildVaccineDose;
use App\Models\Vaccine;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ChildVaccineController extends Controller
{
    public function index(Child $child)
    {
        $user = auth()->user();

        if ($child->barangay !== $user->barangay) {
            abort(403);
        }

        $childVaccines = ChildVaccine::where('child_id', $child->id)
            ->with(['vaccine', 'doses.administeredBy:id,name'])
            ->orderBy('created_at', 'desc')
            ->get();

        $availableVaccines = Vaccine::whereNotIn(
            'id',
            $childVaccines->pluck('vaccine_id')
        )->orderBy('name')->get();

        return Inertia::render('Children/Vaccines', [
            'child' => [
                'id' => $child->id,
                'slug' => $child->slug,
                'fullname' => $child->fullname,
                'barangay' => $child->barangay,
            ],
            'child_vaccines' => $childVaccines->map(fn ($cv) => [
                'id' => $cv->id,
                'vaccine' => $cv->vaccine,
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
            'available_vaccines' => $availableVaccines->map(fn ($v) => [
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
            'vaccine_id' => 'required|exists:vaccines,id',
        ]);

        try {
            ChildVaccine::create([
                'child_id' => $child->id,
                'vaccine_id' => $request->vaccine_id,
            ]);
        } catch (QueryException $e) {
            if ($e->getCode() === '23000') {
                return back()->with('error', 'Vaccine is already assigned to this child.');
            }
            throw $e;
        }

        RefreshDashboardForBarangay::dispatch($child->barangay)
            ->delay(now()->addSeconds(10));

        return back()->with('success', 'Vaccine added to child.');
    }

    public function destroy(Child $child, ChildVaccine $childVaccine)
    {
        $user = auth()->user();

        if ($child->barangay !== $user->barangay) {
            abort(403);
        }

        $child->abortIfOveraged();

        if ($childVaccine->child_id !== $child->id) {
            abort(404);
        }

        $childVaccine->delete();

        RefreshDashboardForBarangay::dispatch($child->barangay)
            ->delay(now()->addSeconds(10));

        return back()->with('success', 'Vaccine removed from child.');
    }

    public function recordDose(Request $request, Child $child, ChildVaccine $childVaccine)
    {
        $user = auth()->user();

        if ($child->barangay !== $user->barangay) {
            abort(403);
        }

        $child->abortIfOveraged();

        if ($childVaccine->child_id !== $child->id) {
            abort(404);
        }

        $request->validate([
            'dose_number' => 'required|integer|min:1',
            'date_given' => 'nullable|date',
            'next_due_date' => 'nullable|date',
            'remarks' => 'nullable|string|max:1000',
        ]);

        $doseNumber = (int) $request->dose_number;

        [$existing, $dose] = DB::transaction(function () use ($childVaccine, $doseNumber, $request, $user) {
            $existing = ChildVaccineDose::where('child_vaccine_id', $childVaccine->id)
                ->where('dose_number', $doseNumber)
                ->lockForUpdate()
                ->first();

            if ($existing) {
                return [$existing, null];
            }

            $dose = ChildVaccineDose::create([
                'child_vaccine_id' => $childVaccine->id,
                'dose_number' => $doseNumber,
                'date_given' => $request->date_given ?: null,
                'next_due_date' => $request->next_due_date ?: null,
                'remarks' => $request->remarks,
                'administered_by' => $user->id,
            ]);

            return [null, $dose];
        });

        if ($existing) {
            return back()->withErrors(['dose_number' => 'Dose #'.$doseNumber.' already exists for this vaccine.']);
        }

        RefreshDashboardForBarangay::dispatch($child->barangay)
            ->delay(now()->addSeconds(10));

        return back()->with('success', 'Dose recorded successfully.');
    }

    public function updateDose(Request $request, Child $child, ChildVaccine $childVaccine, ChildVaccineDose $dose)
    {
        $user = auth()->user();

        if ($child->barangay !== $user->barangay) {
            abort(403);
        }

        $child->abortIfOveraged();

        if ($childVaccine->child_id !== $child->id) {
            abort(404);
        }

        if ($dose->child_vaccine_id !== $childVaccine->id) {
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

    public function destroyDose(Child $child, ChildVaccine $childVaccine, ChildVaccineDose $dose)
    {
        $user = auth()->user();

        if ($child->barangay !== $user->barangay) {
            abort(403);
        }

        $child->abortIfOveraged();

        if ($childVaccine->child_id !== $child->id) {
            abort(404);
        }

        if ($dose->child_vaccine_id !== $childVaccine->id) {
            abort(404);
        }

        $dose->delete();

        RefreshDashboardForBarangay::dispatch($child->barangay)
            ->delay(now()->addSeconds(10));

        return back()->with('success', 'Dose deleted.');
    }
}
