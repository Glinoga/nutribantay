<?php

namespace App\Http\Controllers;

use App\Helpers\AIRecommender;
use App\Helpers\GrowthHelper;
use App\Models\Child;
use App\Models\HealthLog;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
<<<<<<< Updated upstream
use App\Helpers\GrowthHelper;
=======
>>>>>>> Stashed changes

class HealthlogController extends Controller
{
    public function index()
    {
<<<<<<< Updated upstream
        $healthlogs = HealthLog::with(['child', 'user'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Healthlog/Index', [
            'healthlogs' => $healthlogs,
=======
        $user = auth()->user();

        $query = HealthLog::with(['child', 'user']);

        // Non-admins restricted to their barangay
        if (! $user->hasRole('Admin')) {
            $query->whereHas('child', function ($q) use ($user) {
                $q->where('barangay', $user->barangay);
            });
        }

        // Search filter
        if ($request->search) {
            $search = $request->search;
            $query->whereHas('child', function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('sex', 'like', "%{$search}%")
                    ->orWhere('barangay', 'like', "%{$search}%");
            });
        }

        $healthlogs = $query->latest()->get();

        return Inertia::render('Healthlog/Index', [
            'healthlogs' => $healthlogs->map(fn ($log) => [
                'id' => $log->id,
                'child_id' => $log->child_id,
                'child' => [
                    'id' => $log->child->id,
                    'fullname' => $log->child->fullname,
                    'sex' => $log->child->sex,
                ],
                'user' => [
                    'name' => $log->user?->name,
                ],
                'age_in_months' => $log->age_in_months,
                'weight' => $log->weight,
                'height' => $log->height,
                'bmi' => $log->bmi,
                'nutrition_status' => $log->nutrition_status,
                'created_at' => $log->created_at,
            ]),
>>>>>>> Stashed changes
        ]);
    }

    public function create()
    {
        return Inertia::render('Healthlog/Create', [
<<<<<<< Updated upstream
        'children' => Child::all(['id', 'first_name','middle_initial','last_name','sex', 'birthdate']),
=======
            'children' => Child::all([
                'id',
                'first_name',
                'middle_initial',
                'last_name',
                'sex',
                'birthdate',
            ]),
>>>>>>> Stashed changes
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
<<<<<<< Updated upstream
            'child_id'  => 'required|exists:children,id',

            'weight'    => 'nullable|numeric|min:0',
            'height'    => 'nullable|numeric|min:0',
=======
            'child_id' => 'required|exists:children,id',
            'weight' => 'nullable|numeric|min:0',
            'height' => 'nullable|numeric|min:0',
>>>>>>> Stashed changes

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
            'vaccine_status' => 'nullable|string|max:255',
        ]);

        $validated['user_id'] = auth()->id();

        $child = Child::findOrFail($validated['child_id']);
<<<<<<< Updated upstream

=======
>>>>>>> Stashed changes
        $weight = $validated['weight'] ?? null;
        $height = $validated['height'] ?? null;

        if ($weight !== null && $height !== null) {
            $evaluation = GrowthHelper::evaluateChild($child->sex, $child->birthdate, $weight, $height);

            \Log::info('Growth evaluation', $evaluation);

            $validated['bmi'] = $evaluation['bmi'];
            $validated['age_in_months'] = $evaluation['age_months'];
            $validated['status_wfa'] = $evaluation['status_wfa'];
            $validated['status_lfa'] = $evaluation['status_lfa'];
            $validated['status_wfl_wfh'] = $evaluation['status_wfl_wfh'];
            $validated['nutrition_status'] = $evaluation['overall'];
        }

        HealthLog::create($validated);

<<<<<<< Updated upstream
        return redirect()->route('healthlogs.index')->with('success', 'Health log created successfully.');
=======
        // Auto-update child profile with latest healthlog values
        $latestLog = $child->healthlogs()->latest()->first();
        if ($latestLog) {
            $child->update([
                'weight' => $latestLog->weight,
                'height' => $latestLog->height,
            ]);
        }

        return redirect()->route('healthlogs.index')
            ->with('success', '✅ Health log created successfully with BMI, WHO evaluation, and AI recommendation.');
    }

    public function export(Request $request)
    {
        $user = auth()->user();

        $query = HealthLog::query()->with(['child', 'user']);

        // Non-admins restricted to their barangay
        if (! $user->hasRole('Admin')) {
            $query->whereHas('child', fn ($q) => $q->where('barangay', $user->barangay));
        }

        // Age filters
        if ($request->age_min) {
            $minBirthdate = now()->subMonths($request->age_min)->toDateString();
            $query->whereHas('child', fn ($q) => $q->where('birthdate', '<=', $minBirthdate));
        }

        if ($request->age_max) {
            $maxBirthdate = now()->subMonths($request->age_max)->toDateString();
            $query->whereHas('child', fn ($q) => $q->where('birthdate', '>=', $maxBirthdate));
        }

        $healthlogs = $query->latest()->get();

        return $this->exportCSV($healthlogs);
    }

    private function exportCSV($healthlogs)
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="healthlogs_'.date('Y-m-d').'.csv"',
        ];

        $callback = function () use ($healthlogs) {
            $handle = fopen('php://output', 'w');

            // Header row
            fputcsv($handle, [
                'ID',
                'Child Name',
                'Sex',
                'Age (Months)',
                'Weight (kg)',
                'Height (cm)',
                'BMI',
                'Nutrition Status',
                'Created By',
                'Created At',
            ]);

            // Data rows
            foreach ($healthlogs as $log) {
                fputcsv($handle, [
                    $log->id,
                    $log->child->fullname ?? '',
                    $log->child->sex ?? '',
                    $log->age_in_months ?? '',
                    $log->weight ?? '',
                    $log->height ?? '',
                    $log->bmi ?? '',
                    $log->nutrition_status ?? '',
                    $log->user->name ?? '',
                    $log->created_at ?? '',
                ]);
            }

            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
>>>>>>> Stashed changes
    }

    public function show(HealthLog $healthlog)
    {
        $healthlog->load(['child', 'user']);
<<<<<<< Updated upstream
=======

        // Calculate age from child's birthdate if age_in_months is null
        $ageInMonths = $healthlog->age_in_months;
        if ($ageInMonths === null && $healthlog->child && $healthlog->child->birthdate) {
            $ageInMonths = floor(\Carbon\Carbon::parse($healthlog->child->birthdate)->diffInMonths(\Carbon\Carbon::now()));
        }
>>>>>>> Stashed changes

        return Inertia::render('Healthlog/Show', [
            'healthlog' => $healthlog,
        ]);
    }

    public function edit(HealthLog $healthlog)
    {
        return Inertia::render('Healthlog/Edit', [
            'healthlog' => $healthlog->load('child'),
<<<<<<< Updated upstream
            'children'  => Child::all(['id', 'first_name','middle_initial','last_name', 'sex', 'birthdate']),
=======
            'children' => Child::all([
                'id',
                'first_name',
                'middle_initial',
                'last_name',
                'sex',
                'birthdate',
            ]),
>>>>>>> Stashed changes
        ]);
    }

    public function update(Request $request, HealthLog $healthlog)
    {
        $validated = $request->validate([
<<<<<<< Updated upstream
            'child_id'  => 'required|exists:children,id',

            'weight'    => 'nullable|numeric|min:0',
            'height'    => 'nullable|numeric|min:0',
=======
            'child_id' => 'required|exists:children,id',
            'weight' => 'nullable|numeric|min:0',
            'height' => 'nullable|numeric|min:0',
>>>>>>> Stashed changes

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
            'vaccine_status' => 'nullable|string|max:255',
        ]);

        $child = Child::findOrFail($validated['child_id']);
<<<<<<< Updated upstream

=======
>>>>>>> Stashed changes
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
