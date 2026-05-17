<?php

namespace App\Http\Controllers;

use App\Helpers\AIRecommender;
use App\Helpers\GrowthHelper;
use App\Jobs\RefreshDashboardForBarangay;
use App\Models\Child;
use App\Models\HealthLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HealthlogController extends Controller
{
    public function createForChild(Child $child)
    {
        $user = auth()->user();

        // Healthworker can only create healthlogs for children in their barangay, Admin has full access
        if ($child->barangay !== $user->barangay && ! $user->hasRole('Admin')) {
            abort(403);
        }

        $allHealthLogs = $child->healthlogs()->orderBy('created_at', 'desc')->get();

        return Inertia::render('Healthlog/Create', [
            'child' => [
                'id' => $child->id,
                'slug' => $child->slug,
                'fullname' => $child->fullname,
                'sex' => $child->sex,
                'birthdate' => $child->birthdate,
                'weight' => $child->weight,
                'height' => $child->height,
            ],
            'allHealthLogs' => $allHealthLogs->map(function ($log) {
                return [
                    'id' => $log->id,
                    'weight' => $log->weight,
                    'height' => $log->height,
                    'bmi' => $log->bmi,
                    'nutrition_status' => $log->nutrition_status,
                    'micronutrient_powder' => $log->micronutrient_powder,
                    'rutf' => $log->rutf,
                    'rusf' => $log->rusf,
                    'complementary_food' => $log->complementary_food,
                    'vitamin_a' => $log->vitamin_a,
                    'deworming' => $log->deworming,
                    'created_at' => $log->created_at,
                ];
            })->toArray(),
            'latestHealthLog' => $allHealthLogs->first() ? [
                'weight' => $allHealthLogs->first()->weight,
                'height' => $allHealthLogs->first()->height,
                'bmi' => $allHealthLogs->first()->bmi,
                'nutrition_status' => $allHealthLogs->first()->nutrition_status,
                'micronutrient_powder' => $allHealthLogs->first()->micronutrient_powder,
                'rutf' => $allHealthLogs->first()->rutf,
                'rusf' => $allHealthLogs->first()->rusf,
                'complementary_food' => $allHealthLogs->first()->complementary_food,
                'vitamin_a' => $allHealthLogs->first()->vitamin_a,
                'deworming' => $allHealthLogs->first()->deworming,
                'created_at' => $allHealthLogs->first()->created_at,
            ] : null,
        ]);
    }

    public function storeForChild(Request $request, Child $child)
    {
        $user = auth()->user();

        // Healthworker can only add healthlogs for children in their barangay, Admin has full access
        if ($child->barangay !== $user->barangay && ! $user->hasRole('Admin')) {
            abort(403);
        }

        $validated = $request->validate([
            'weight' => 'nullable|numeric|min:0',
            'height' => 'nullable|numeric|min:0',

            'micronutrient_powder' => 'nullable|string|max:255',
            'ruf' => 'nullable|string|max:255',
            'rusf' => 'nullable|string|max:255',
            'complementary_food' => 'nullable|string|max:255',

            'vitamin_a' => 'nullable|boolean',
            'deworming' => 'nullable|boolean',
        ]);

        $validated['user_id'] = auth()->id();
        $validated['child_id'] = $child->id;

        // Note: vaccine_status is auto-calculated by the model accessor

        $weight = $validated['weight'] ?? null;
        $height = $validated['height'] ?? null;

        if ($weight !== null && $height !== null) {
            $evaluation = GrowthHelper::evaluateChild(
                $child->sex,
                $child->birthdate,
                $weight,
                $height
            );

            \Log::info('Growth evaluation', $evaluation);

            $validated['bmi'] = $evaluation['bmi'];
            $validated['age_in_months'] = $evaluation['age_months'];
            $validated['status_wfa'] = $evaluation['status_wfa'];
            $validated['status_lfa'] = $evaluation['status_lfa'];
            $validated['status_wfl_wfh'] = $evaluation['status_wfl_wfh'];
            $validated['nutrition_status'] = $evaluation['overall'];

            $validated['recommendation'] = AIRecommender::getRecommendation(
                $evaluation['overall'],
                $child->sex,
                $evaluation['age_months'],
                $evaluation['bmi']
            );
        }

        HealthLog::create($validated);

        // Auto-update child's current weight/height/nutrition_status with latest health log
        if (! empty($validated['weight']) && ! empty($validated['height'])) {
            $child->update([
                'weight' => $validated['weight'],
                'height' => $validated['height'],
                'nutrition_status' => $validated['nutrition_status'] ?? null,
                'updated_by' => auth()->id(),
            ]);
        }

        RefreshDashboardForBarangay::dispatch($child->barangay)
            ->delay(now()->addSeconds(10));

        return redirect()->route('children.show', $child->id)
            ->with('success', '✅ Health log added successfully.');
    }

    public function edit(HealthLog $healthlog)
    {
        $user = auth()->user();

        // Healthworker can only edit healthlogs for children in their barangay, Admin has full access
        if ($healthlog->child->barangay !== $user->barangay && ! $user->hasRole('Admin')) {
            abort(403);
        }

        return Inertia::render('Healthlog/Edit', [
            'healthlog' => $healthlog->load('child'),
            'child_id' => $healthlog->child_id, // Explicitly pass child_id for reliable navigation
        ]);
    }

    public function update(Request $request, HealthLog $healthlog)
    {
        $user = auth()->user();

        // Healthworker can only update healthlogs for children in their barangay, Admin has full access
        if ($healthlog->child->barangay !== $user->barangay && ! $user->hasRole('Admin')) {
            abort(403);
        }

        $validated = $request->validate([
            'weight' => 'nullable|numeric|min:0',
            'height' => 'nullable|numeric|min:0',

            'micronutrient_powder' => 'nullable|string|max:255',
            'ruf' => 'nullable|string|max:255',
            'rusf' => 'nullable|string|max:255',
            'complementary_food' => 'nullable|string|max:255',

            'vitamin_a' => 'nullable|boolean',
            'deworming' => 'nullable|boolean',
        ]);

        // Note: vaccine_status is auto-calculated by the model accessor

        // Resolve child from the existing healthlog (child-centric: child_id is immutable)
        $child = Child::findOrFail($healthlog->child_id);
        $weight = $validated['weight'] ?? null;
        $height = $validated['height'] ?? null;

        if ($weight !== null && $height !== null) {
            $evaluation = GrowthHelper::evaluateChild(
                $child->sex,
                $child->birthdate,
                $weight,
                $height
            );

            $validated['bmi'] = $evaluation['bmi'];
            $validated['age_in_months'] = $evaluation['age_months'];
            $validated['status_wfa'] = $evaluation['status_wfa'];
            $validated['status_lfa'] = $evaluation['status_lfa'];
            $validated['status_wfl_wfh'] = $evaluation['status_wfl_wfh'];
            $validated['nutrition_status'] = $evaluation['overall'];

            $validated['recommendation'] = AIRecommender::getRecommendation(
                $evaluation['overall'],
                $child->sex,
                $evaluation['age_months'],
                $evaluation['bmi']
            );
        }

        $healthlog->update($validated);

        // Sync nutrition_status to child if weight/height were updated
        if ($weight !== null && $height !== null) {
            $child->update([
                'weight' => $validated['weight'],
                'height' => $validated['height'],
                'nutrition_status' => $validated['nutrition_status'] ?? null,
                'updated_by' => auth()->id(),
            ]);
        }

        RefreshDashboardForBarangay::dispatch($child->barangay)
            ->delay(now()->addSeconds(10));

        return redirect()->route('children.show', $child->id)
            ->with('success', 'Health log updated successfully.');
    }

    public function destroy(HealthLog $healthlog)
    {
        $user = auth()->user();

        // Healthworker can only delete healthlogs for children in their barangay, Admin has full access
        if ($healthlog->child->barangay !== $user->barangay && ! $user->hasRole('Admin')) {
            abort(403);
        }

        $childId = $healthlog->child_id;
        $barangay = $healthlog->child->barangay;
        $healthlog->delete();

        RefreshDashboardForBarangay::dispatch($barangay)
            ->delay(now()->addSeconds(10));

        return redirect()->route('children.show', $childId)
            ->with('success', 'Health log deleted.');
    }

    public function archived()
    {
        $user = auth()->user();

        $archivedLogs = HealthLog::onlyTrashed()
            ->whereHas('child', fn ($q) => $q->where('barangay', $user->barangay))
            ->with('child')
            ->get()
            ->map(fn ($log) => [
                'id' => $log->id,
                'child_id' => $log->child_id,
                'weight' => $log->weight,
                'height' => $log->height,
                'bmi' => $log->bmi,
                'nutrition_status' => $log->nutrition_status,
                'deleted_at' => $log->deleted_at,
            ]);

        return Inertia::render('Healthlog/Archived', [
            'healthlogs' => archivedLogs,
        ]);
    }

    public function restore($id)
    {
        $user = auth()->user();

        $healthlog = HealthLog::onlyTrashed()->findOrFail($id);

        if ($healthlog->child->barangay !== $user->barangay && ! $user->hasRole('Admin')) {
            abort(403);
        }

        $healthlog->restore();

        return redirect()->route('healthlogs.archived')->with('success', 'Health log restored successfully!');
    }

    public function forceDelete($id)
    {
        $user = auth()->user();

        $healthlog = HealthLog::onlyTrashed()->findOrFail($id);

        if ($healthlog->child->barangay !== $user->barangay && ! $user->hasRole('Admin')) {
            abort(403);
        }

        $healthlog->forceDelete();

        return redirect()->route('healthlogs.archived')->with('success', 'Health log permanently deleted.');
    }
}
