<?php

namespace App\Http\Controllers;

use App\Helpers\AIRecommender;
use App\Helpers\GrowthHelper;
use App\Jobs\RefreshDashboardForBarangay;
use App\Models\Child;
use App\Models\ChildVaccine;
use App\Models\ChildVaccineDose;
use App\Models\ChildVitamin;
use App\Models\ChildVitaminDose;
use App\Models\HealthLog;
use App\Models\Vaccine;
use App\Models\Vitamin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class HealthlogController extends Controller
{
    public function createForChild(Child $child)
    {
        $user = auth()->user();

        if ($child->barangay !== $user->barangay) {
            abort(403);
        }

        $child->abortIfOveraged();

        $allHealthLogs = $child->healthlogs()->orderBy('created_at', 'desc')->get();

        $vaccines = Vaccine::all(['id', 'name']);
        $vitamins = Vitamin::all(['id', 'name']);

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
                    'ruf' => $log->ruf,
                    'rusf' => $log->rusf,
                    'complementary_food' => $log->complementary_food,
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
                'ruf' => $allHealthLogs->first()->ruf,
                'rusf' => $allHealthLogs->first()->rusf,
                'complementary_food' => $allHealthLogs->first()->complementary_food,
                'deworming' => $allHealthLogs->first()->deworming,
                'created_at' => $allHealthLogs->first()->created_at,
            ] : null,
            'vaccines' => $vaccines,
            'vitamins' => $vitamins,
        ]);
    }

    public function storeForChild(Request $request, Child $child)
    {
        $user = auth()->user();

        if ($child->barangay !== $user->barangay) {
            abort(403);
        }

        $child->abortIfOveraged();

        $validated = $request->validate([
            'weight' => 'nullable|numeric|min:0.1|max:200',
            'height' => 'nullable|numeric|min:0.1|max:250',

            'micronutrient_powder' => 'nullable|string|max:255',
            'ruf' => 'nullable|string|max:255',
            'rusf' => 'nullable|string|max:255',
            'complementary_food' => 'nullable|string|max:255',

            'deworming' => 'nullable|boolean',

            'vaccine_ids' => 'nullable|array',
            'vaccine_ids.*' => 'exists:vaccines,id',
            'vitamin_ids' => 'nullable|array',
            'vitamin_ids.*' => 'exists:vitamins,id',
        ]);

        $validated['user_id'] = auth()->id();
        $validated['child_id'] = $child->id;

        $vaccineIds = $validated['vaccine_ids'] ?? [];
        $vitaminIds = $validated['vitamin_ids'] ?? [];
        unset($validated['vaccine_ids'], $validated['vitamin_ids']);

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

            $recommendation = AIRecommender::getRecommendation(
                $evaluation['overall'],
                $child->sex,
                $evaluation['age_months'],
                in_array(Vitamin::where('name', 'Vitamin A')->value('id'), $vitaminIds) ? 'Yes' : 'No',
                ! empty($validated['deworming']) ? 'Yes' : 'No',
                $child->id,
            );
            $validated['recommendation'] = $recommendation !== '' ? $recommendation : null;
        }

        DB::transaction(function () use ($validated, $child, $vaccineIds, $vitaminIds) {
            $healthLog = HealthLog::create($validated);

            // Auto-create dose records for each checked vaccine
            foreach ($vaccineIds as $vaccineId) {
                $childVaccine = ChildVaccine::firstOrCreate([
                    'child_id' => $child->id,
                    'vaccine_id' => $vaccineId,
                ]);
                $nextDoseNumber = ($childVaccine->doses()
                    ->lockForUpdate()
                    ->max('dose_number') ?? 0) + 1;
                ChildVaccineDose::create([
                    'child_vaccine_id' => $childVaccine->id,
                    'healthlog_id' => $healthLog->id,
                    'dose_number' => $nextDoseNumber,
                    'date_given' => now()->toDateString(),
                    'administered_by' => auth()->id(),
                    'remarks' => 'Recorded from health log checkup',
                ]);
            }

            // Auto-create dose records for each checked vitamin
            foreach ($vitaminIds as $vitaminId) {
                $childVitamin = ChildVitamin::firstOrCreate([
                    'child_id' => $child->id,
                    'vitamin_id' => $vitaminId,
                ]);
                $nextDoseNumber = ($childVitamin->doses()
                    ->lockForUpdate()
                    ->max('dose_number') ?? 0) + 1;
                ChildVitaminDose::create([
                    'child_vitamin_id' => $childVitamin->id,
                    'healthlog_id' => $healthLog->id,
                    'dose_number' => $nextDoseNumber,
                    'date_given' => now()->toDateString(),
                    'administered_by' => auth()->id(),
                    'remarks' => 'Recorded from health log checkup',
                ]);
            }

            // Auto-update child's current weight/height/nutrition_status with latest health log
            if (! empty($validated['weight']) && ! empty($validated['height'])) {
                $child->update([
                    'weight' => $validated['weight'],
                    'height' => $validated['height'],
                    'nutrition_status' => $validated['nutrition_status'] ?? null,
                    'updated_by' => auth()->id(),
                ]);
            }
        });

        RefreshDashboardForBarangay::dispatch($child->barangay)
            ->delay(now()->addSeconds(10));

        return redirect()->route('children.show', $child->id)
            ->with('success', '✅ Health log added successfully.');
    }

    public function edit(HealthLog $healthlog)
    {
        $user = auth()->user();

        if ($healthlog->child->barangay !== $user->barangay) {
            abort(403);
        }

        $healthlog->child->abortIfOveraged();

        $vaccines = Vaccine::all(['id', 'name']);
        $vitamins = Vitamin::all(['id', 'name']);

        // Pre-populate checked IDs from existing dose records linked to this healthlog
        $existingVaccineIds = ChildVaccineDose::where('healthlog_id', $healthlog->id)
            ->with('childVaccine')
            ->get()
            ->pluck('childVaccine.vaccine_id')
            ->unique()
            ->values()
            ->toArray();

        $existingVitaminIds = ChildVitaminDose::where('healthlog_id', $healthlog->id)
            ->with('childVitamin')
            ->get()
            ->pluck('childVitamin.vitamin_id')
            ->unique()
            ->values()
            ->toArray();

        return Inertia::render('Healthlog/Edit', [
            'healthlog' => $healthlog->load('child'),
            'child_id' => $healthlog->child_id,
            'vaccines' => $vaccines,
            'vitamins' => $vitamins,
            'existingVaccineIds' => $existingVaccineIds,
            'existingVitaminIds' => $existingVitaminIds,
        ]);
    }

    public function update(Request $request, HealthLog $healthlog)
    {
        $user = auth()->user();

        if ($healthlog->child->barangay !== $user->barangay) {
            abort(403);
        }

        $healthlog->child->abortIfOveraged();

        $validated = $request->validate([
            'weight' => 'nullable|numeric|min:0.1|max:200',
            'height' => 'nullable|numeric|min:0.1|max:250',

            'micronutrient_powder' => 'nullable|string|max:255',
            'ruf' => 'nullable|string|max:255',
            'rusf' => 'nullable|string|max:255',
            'complementary_food' => 'nullable|string|max:255',

            'deworming' => 'nullable|boolean',

            'vaccine_ids' => 'nullable|array',
            'vaccine_ids.*' => 'exists:vaccines,id',
            'vitamin_ids' => 'nullable|array',
            'vitamin_ids.*' => 'exists:vitamins,id',
        ]);

        // Resolve child from the existing healthlog (child-centric: child_id is immutable)
        $child = Child::findOrFail($healthlog->child_id);
        $weight = $validated['weight'] ?? null;
        $height = $validated['height'] ?? null;

        $vaccineIds = $validated['vaccine_ids'] ?? [];
        $vitaminIds = $validated['vitamin_ids'] ?? [];
        unset($validated['vaccine_ids'], $validated['vitamin_ids']);

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

            $recommendation = AIRecommender::getRecommendation(
                $evaluation['overall'],
                $child->sex,
                $evaluation['age_months'],
                in_array(Vitamin::where('name', 'Vitamin A')->value('id'), $vitaminIds) ? 'Yes' : 'No',
                ! empty($validated['deworming']) ? 'Yes' : 'No',
                $child->id,
            );
            $validated['recommendation'] = $recommendation !== '' ? $recommendation : null;
        }

        DB::transaction(function () use ($validated, $healthlog, $child, $weight, $height, $vaccineIds, $vitaminIds) {
            $healthlog->update($validated);

            // Additive-only: create dose for newly checked vaccines
            $existingVaccineIds = ChildVaccineDose::where('healthlog_id', $healthlog->id)
                ->with('childVaccine')
                ->get()
                ->pluck('childVaccine.vaccine_id')
                ->toArray();
            $newVaccineIds = array_diff($vaccineIds, $existingVaccineIds);

            foreach ($newVaccineIds as $vaccineId) {
                $childVaccine = ChildVaccine::firstOrCreate([
                    'child_id' => $child->id,
                    'vaccine_id' => $vaccineId,
                ]);
                $nextDoseNumber = ($childVaccine->doses()
                    ->lockForUpdate()
                    ->max('dose_number') ?? 0) + 1;
                ChildVaccineDose::create([
                    'child_vaccine_id' => $childVaccine->id,
                    'healthlog_id' => $healthlog->id,
                    'dose_number' => $nextDoseNumber,
                    'date_given' => now()->toDateString(),
                    'administered_by' => auth()->id(),
                    'remarks' => 'Recorded from health log checkup',
                ]);
            }

            // Additive-only: create dose for newly checked vitamins
            $existingVitaminIds = ChildVitaminDose::where('healthlog_id', $healthlog->id)
                ->with('childVitamin')
                ->get()
                ->pluck('childVitamin.vitamin_id')
                ->toArray();
            $newVitaminIds = array_diff($vitaminIds, $existingVitaminIds);

            foreach ($newVitaminIds as $vitaminId) {
                $childVitamin = ChildVitamin::firstOrCreate([
                    'child_id' => $child->id,
                    'vitamin_id' => $vitaminId,
                ]);
                $nextDoseNumber = ($childVitamin->doses()
                    ->lockForUpdate()
                    ->max('dose_number') ?? 0) + 1;
                ChildVitaminDose::create([
                    'child_vitamin_id' => $childVitamin->id,
                    'healthlog_id' => $healthlog->id,
                    'dose_number' => $nextDoseNumber,
                    'date_given' => now()->toDateString(),
                    'administered_by' => auth()->id(),
                    'remarks' => 'Recorded from health log checkup',
                ]);
            }

            // Sync nutrition_status to child if weight/height were updated
            if ($weight !== null && $height !== null) {
                $child->update([
                    'weight' => $validated['weight'],
                    'height' => $validated['height'],
                    'nutrition_status' => $validated['nutrition_status'] ?? null,
                    'updated_by' => auth()->id(),
                ]);
            }
        });

        RefreshDashboardForBarangay::dispatch($child->barangay)
            ->delay(now()->addSeconds(10));

        return redirect()->route('children.show', $child->id)
            ->with('success', 'Health log updated successfully.');
    }

    public function destroy(HealthLog $healthlog, Request $request)
    {
        $user = auth()->user();

        if ($healthlog->child->barangay !== $user->barangay) {
            abort(403);
        }

        $healthlog->child->abortIfOveraged();

        $childId = $healthlog->child_id;
        $barangay = $healthlog->child->barangay;
        $healthlog->delete();

        RefreshDashboardForBarangay::dispatch($barangay)
            ->delay(now()->addSeconds(10));

        $page = $request->query('page', 1);

        return redirect()->route('children.show', [
            'child' => $childId,
            'page' => $page,
        ])->with('success', 'Health log deleted.');
    }
}
