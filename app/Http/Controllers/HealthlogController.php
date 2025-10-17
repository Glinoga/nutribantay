<?php

namespace App\Http\Controllers;

use App\Models\Healthlog;
use App\Models\Child;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Helpers\GrowthHelper;
use Carbon\Carbon;

class HealthlogController extends Controller
{
    public function index()
    {
        $healthlogs = Healthlog::with('child')->latest()->get();

        return Inertia::render('Healthlog/Index', [
            'healthlogs' => $healthlogs,
        ]);
    }

    public function create()
    {
        // Include sex and birthdate for GrowthHelper
        $children = Child::select('id', 'name', 'sex', 'birthdate')->get();

        return Inertia::render('Healthlog/Create', [
            'children' => $children,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'child_id' => 'required|exists:children,id',
            'weight' => 'nullable|numeric|min:0',
            'height' => 'nullable|numeric|min:0',
            'bmi' => 'nullable|numeric|min:0',
            'zscore_wfa' => 'nullable|numeric',
            'zscore_lfa' => 'nullable|numeric',
            'zscore_wfh' => 'nullable|numeric',
            'nutrition_status' => 'nullable|string|max:255',
            'micronutrient_powder' => 'nullable|string|max:255',
            'ruf' => 'nullable|string|max:255',
            'rusf' => 'nullable|string|max:255',
            'complementary_food' => 'nullable|string|max:255',
            'vitamin_a' => 'boolean',
            'deworming' => 'boolean',
            'vaccine_name' => 'nullable|string|max:255',
            'dose_number' => 'nullable|integer',
            'date_given' => 'nullable|date',
            'next_due_date' => 'nullable|date',
            'vaccine_status' => 'nullable|string|max:255',
        ]);

        $child = Child::find($validated['child_id']);

        // ✅ Compute BMI
        if (!empty($validated['weight']) && !empty($validated['height'])) {
            $validated['bmi'] = GrowthHelper::calculateBMI(
                $validated['weight'],
                $validated['height']
            );
        }

        // ✅ Compute Z-scores & nutrition status
        if ($child && !empty($validated['weight']) && !empty($validated['height'])) {
            $zScores = GrowthHelper::calculateZScores(
                $child->sex ?? 'Male',
                $child->birthdate ?? Carbon::now()->subYears(1),
                $validated['weight'],
                $validated['height']
            );

            $validated['zscore_wfa'] = $zScores['wfa'];
            $validated['zscore_lfa'] = $zScores['lfa'];
            $validated['zscore_wfh'] = $zScores['wfh'];
            $validated['nutrition_status'] = $zScores['status'];
        }

        Healthlog::create($validated);

        return redirect()->route('healthlogs.index')
            ->with('success', 'Health log created successfully with BMI and WHO-based evaluation.');
    }

    public function show(Healthlog $healthlog)
    {
        $healthlog->load('child');

        return Inertia::render('Healthlog/Show', [
            'healthlog' => $healthlog,
        ]);
    }

    public function edit(Healthlog $healthlog)
    {
        $healthlog->load('child');
        $children = Child::select('id', 'name', 'sex', 'birthdate')->get();

        return Inertia::render('Healthlog/Edit', [
            'healthlog' => $healthlog,
            'children' => $children,
        ]);
    }

    public function update(Request $request, Healthlog $healthlog)
    {
        $validated = $request->validate([
            'child_id' => 'required|exists:children,id',
            'weight' => 'nullable|numeric|min:0',
            'height' => 'nullable|numeric|min:0',
            'bmi' => 'nullable|numeric|min:0',
            'zscore_wfa' => 'nullable|numeric',
            'zscore_lfa' => 'nullable|numeric',
            'zscore_wfh' => 'nullable|numeric',
            'nutrition_status' => 'nullable|string|max:255',
            'micronutrient_powder' => 'nullable|string|max:255',
            'ruf' => 'nullable|string|max:255',
            'rusf' => 'nullable|string|max:255',
            'complementary_food' => 'nullable|string|max:255',
            'vitamin_a' => 'boolean',
            'deworming' => 'boolean',
            'vaccine_name' => 'nullable|string|max:255',
            'dose_number' => 'nullable|integer',
            'date_given' => 'nullable|date',
            'next_due_date' => 'nullable|date',
            'vaccine_status' => 'nullable|string|max:255',
        ]);

        $child = Child::find($validated['child_id']);

        // ✅ Recompute BMI and z-scores
        if ($child && !empty($validated['weight']) && !empty($validated['height'])) {
            $validated['bmi'] = GrowthHelper::calculateBMI(
                $validated['weight'],
                $validated['height']
            );

            $zScores = GrowthHelper::calculateZScores(
                $child->sex ?? 'Male',
                $child->birthdate ?? Carbon::now()->subYears(1),
                $validated['weight'],
                $validated['height']
            );

            $validated['zscore_wfa'] = $zScores['wfa'];
            $validated['zscore_lfa'] = $zScores['lfa'];
            $validated['zscore_wfh'] = $zScores['wfh'];
            $validated['nutrition_status'] = $zScores['status'];
        }

        $healthlog->update($validated);

        return redirect()->route('healthlogs.index')
            ->with('success', 'Health log updated successfully with recalculated BMI and nutrition data.');
    }

    public function destroy(Healthlog $healthlog)
    {
        $healthlog->delete();

        return redirect()->route('healthlogs.index')
            ->with('success', 'Health log entry deleted.');
    }
}
