<?php

namespace App\Http\Controllers;

use App\Helpers\AIRecommender;
use App\Helpers\GrowthHelper;
use App\Models\Child;
use App\Models\HealthLog;
use Carbon\Carbon;
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

        return Inertia::render('Healthlog/Create', [
            'child' => [
                'id' => $child->id,
                'fullname' => $child->fullname,
                'sex' => $child->sex,
                'birthdate' => $child->birthdate,
            ],
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

            'vaccine_name' => 'nullable|string|max:255',
            'dose_number' => 'nullable|numeric',
            'date_given' => 'nullable|date',
            'next_due_date' => 'nullable|date',
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

            $age = Carbon::parse($child->birthdate)->age;

            $validated['recommendation'] = AIRecommender::getRecommendation(
                $evaluation['overall'],
                $child->sex,
                $age,
                $evaluation['bmi']
            );
        }

        HealthLog::create($validated);

        // Auto-update child's current weight/height with latest health log (only if values exist)
        if (! empty($validated['weight']) && ! empty($validated['height'])) {
            $child->update([
                'weight' => $validated['weight'],
                'height' => $validated['height'],
                'updated_by' => auth()->id(),
            ]);
        }

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

            'vaccine_name' => 'nullable|string|max:255',
            'dose_number' => 'nullable|numeric',
            'date_given' => 'nullable|date',
            'next_due_date' => 'nullable|date',
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

            $age = Carbon::parse($child->birthdate)->age;

            $validated['recommendation'] = AIRecommender::getRecommendation(
                $evaluation['overall'],
                $child->sex,
                $age,
                $evaluation['bmi']
            );
        }

        $healthlog->update($validated);

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
        $healthlog->delete();

        return redirect()->route('children.show', $childId)
            ->with('success', 'Health log deleted.');
    }
}
