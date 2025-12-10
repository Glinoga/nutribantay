<?php

namespace App\Http\Controllers;

use App\Models\HealthLog;
use App\Models\Child;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Helpers\GrowthHelper;

class HealthlogController extends Controller
{
    public function index()
    {
        $healthlogs = HealthLog::with(['child', 'user'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Healthlog/Index', [
            'healthlogs' => $healthlogs,
        ]);
    }

    public function create()
    {
        return Inertia::render('Healthlog/Create', [
            'children' => Child::all(['id', 'fullname', 'sex', 'birthdate']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'child_id'  => 'required|exists:children,id',

            'weight'    => 'nullable|numeric|min:0',
            'height'    => 'nullable|numeric|min:0',

            'micronutrient_powder' => 'nullable|string|max:255',
            'ruf'                  => 'nullable|string|max:255',
            'rusf'                 => 'nullable|string|max:255',
            'complementary_food'   => 'nullable|string|max:255',

            'vitamin_a' => 'nullable|boolean',
            'deworming' => 'nullable|boolean',

            'vaccine_name'  => 'nullable|string|max:255',
            'dose_number'   => 'nullable|numeric',
            'date_given'    => 'nullable|date',
            'next_due_date' => 'nullable|date',
            'vaccine_status'=> 'nullable|string|max:255',
        ]);

        $validated['user_id'] = auth()->id();

        $child = Child::findOrFail($validated['child_id']);

        $weight = $validated['weight'] ?? null;
        $height = $validated['height'] ?? null;

        if ($weight && $height) {
            $evaluation = GrowthHelper::evaluateChild($child->sex, $child->birthdate, $weight, $height);

            $validated['bmi'] = $evaluation['bmi'];
            $validated['age_in_months'] = $evaluation['age_months'];
            $validated['status_wfa'] = $evaluation['status_wfa'];
            $validated['status_lfa'] = $evaluation['status_lfa'];
            $validated['status_wfl_wfh'] = $evaluation['status_wfl_wfh'];
            $validated['nutrition_status'] = $evaluation['overall'];
        }

        HealthLog::create($validated);

        return redirect()->route('healthlogs.index')->with('success', 'Health log created successfully.');
    }

    public function show(HealthLog $healthlog)
    {
        $healthlog->load(['child', 'user']);

        return Inertia::render('Healthlog/Show', [
            'healthlog' => $healthlog,
        ]);
    }

    public function edit(HealthLog $healthlog)
    {
        return Inertia::render('Healthlog/Edit', [
            'healthlog' => $healthlog->load('child'),
            'children'  => Child::all(['id', 'fullname', 'sex', 'birthdate']),
        ]);
    }

    public function update(Request $request, HealthLog $healthlog)
    {
        $validated = $request->validate([
            'child_id'  => 'required|exists:children,id',

            'weight'    => 'nullable|numeric|min:0',
            'height'    => 'nullable|numeric|min:0',

            'micronutrient_powder' => 'nullable|string|max:255',
            'ruf'                  => 'nullable|string|max:255',
            'rusf'                 => 'nullable|string|max:255',
            'complementary_food'   => 'nullable|string|max:255',

            'vitamin_a' => 'nullable|boolean',
            'deworming' => 'nullable|boolean',

            'vaccine_name'  => 'nullable|string|max:255',
            'dose_number'   => 'nullable|numeric',
            'date_given'    => 'nullable|date',
            'next_due_date' => 'nullable|date',
            'vaccine_status'=> 'nullable|string|max:255',
        ]);

        $child = Child::findOrFail($validated['child_id']);

        $weight = $validated['weight'] ?? null;
        $height = $validated['height'] ?? null;

        if ($weight && $height) {
            $evaluation = GrowthHelper::evaluateChild($child->sex, $child->birthdate, $weight, $height);

            $validated['bmi'] = $evaluation['bmi'];
            $validated['age_in_months'] = $evaluation['age_months'];
            $validated['status_wfa'] = $evaluation['status_wfa'];
            $validated['status_lfa'] = $evaluation['status_lfa'];
            $validated['status_wfl_wfh'] = $evaluation['status_wfl_wfh'];
            $validated['nutrition_status'] = $evaluation['overall'];
        }

        $healthlog->update($validated);

        return redirect()->route('healthlogs.index')->with('success', 'Health log updated successfully.');
    }

    public function destroy(HealthLog $healthlog)
    {
        $healthlog->delete();

        return redirect()->route('healthlogs.index')->with('success', 'Health log deleted.');
    }
}
