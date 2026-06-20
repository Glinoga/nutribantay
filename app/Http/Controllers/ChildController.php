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
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ChildController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $now = Carbon::now();

        $query = Child::with(['creator', 'updater', 'latestHealthlog'])
            ->where('barangay', $user->barangay)
            ->where('birthdate', '>=', now()->subMonths(60));

        // Search filter
        if ($request->search) {
            $search = $request->search;

            if (is_numeric($search)) {
                $minBirthdate = now()->subMonths($search)->toDateString();
                $query->where('birthdate', '<=', $minBirthdate);
            } else {
                $query->where(function ($q) use ($search) {
                    $searchLower = strtolower($search);
                    $q->where(function ($wq) use ($search) {
                        $words = explode(' ', $search);
                        foreach ($words as $word) {
                            $wq->where(function ($xq) use ($word) {
                                $xq->where('first_name', 'like', "%{$word}%")
                                    ->orWhere('last_name', 'like', "%{$word}%");
                            });
                        }
                    })
                        ->orWhereRaw('LOWER(sex) = ?', [$searchLower]);
                });
            }
        }

        // Sex filter
        if ($request->sex) {
            $query->where('sex', $request->sex);
        }

        // Vaccine status filter - database level using subqueries
        $vaccineStatus = $request->vaccine_status;

        if ($vaccineStatus === 'overdue') {
            $overdueChildIdsQuery = ChildVaccineDose::select('cv.child_id')
                ->join('child_vaccines as cv', 'child_vaccine_doses.child_vaccine_id', '=', 'cv.id')
                ->whereNull('child_vaccine_doses.date_given')
                ->whereNotNull('child_vaccine_doses.next_due_date')
                ->where('child_vaccine_doses.next_due_date', '<', $now->toDateString());
            $query->whereIn('id', $overdueChildIdsQuery);
        } elseif ($vaccineStatus === 'mixed') {
            // Show children with BOTH overdue AND upcoming doses
            $mixedChildIdsQuery = ChildVaccineDose::select('cv.child_id')
                ->join('child_vaccines as cv', 'child_vaccine_doses.child_vaccine_id', '=', 'cv.id')
                ->whereNull('child_vaccine_doses.date_given')
                ->whereNotNull('child_vaccine_doses.next_due_date')
                ->where('child_vaccine_doses.next_due_date', '<', $now->toDateString());

            $query->whereIn('id', $mixedChildIdsQuery)
                ->whereExists(function ($q) use ($now) {
                    $q->select(DB::raw(1))
                        ->from('child_vaccine_doses as cvd2')
                        ->join('child_vaccines as cv2', 'cvd2.child_vaccine_id', '=', 'cv2.id')
                        ->whereColumn('cv2.child_id', 'children.id')
                        ->whereNull('cvd2.date_given')
                        ->whereNotNull('cvd2.next_due_date')
                        ->where('cvd2.next_due_date', '>=', $now->toDateString());
                });
        } elseif ($vaccineStatus === 'upcoming') {
            // Only show children with upcoming doses who have NO overdue doses
            $upcomingOnlyChildIdsQuery = ChildVaccineDose::select('cv.child_id')
                ->join('child_vaccines as cv', 'child_vaccine_doses.child_vaccine_id', '=', 'cv.id')
                ->whereNull('child_vaccine_doses.date_given')
                ->whereNotNull('child_vaccine_doses.next_due_date')
                ->where('child_vaccine_doses.next_due_date', '>=', $now->toDateString())
                ->whereNotIn('cv.child_id', function ($q) use ($now) {
                    $q->select('cv2.child_id')
                        ->from('child_vaccine_doses as cvd2')
                        ->join('child_vaccines as cv2', 'cvd2.child_vaccine_id', '=', 'cv2.id')
                        ->whereNull('cvd2.date_given')
                        ->whereNotNull('cvd2.next_due_date')
                        ->where('cvd2.next_due_date', '<', $now->toDateString());
                });
            $query->whereIn('id', $upcomingOnlyChildIdsQuery);
        }

        // Vitamin status filter
        $vitaminStatus = $request->vitamin_status;

        if ($vitaminStatus === 'overdue') {
            $overdueVitaminChildIds = ChildVitaminDose::select('cv.child_id')
                ->join('child_vitamins as cv', 'child_vitamin_doses.child_vitamin_id', '=', 'cv.id')
                ->whereNull('child_vitamin_doses.date_given')
                ->whereNotNull('child_vitamin_doses.next_due_date')
                ->where('child_vitamin_doses.next_due_date', '<', $now->toDateString());
            $query->whereIn('id', $overdueVitaminChildIds);
        } elseif ($vitaminStatus === 'upcoming') {
            $upcomingVitaminChildIds = ChildVitaminDose::select('cv.child_id')
                ->join('child_vitamins as cv', 'child_vitamin_doses.child_vitamin_id', '=', 'cv.id')
                ->whereNull('child_vitamin_doses.date_given')
                ->whereNotNull('child_vitamin_doses.next_due_date')
                ->where('child_vitamin_doses.next_due_date', '>=', $now->toDateString());
            $query->whereIn('id', $upcomingVitaminChildIds);
        }

        $children = $query->paginate(25, ['*'], 'page', $request->page ?? 1);

        // Get all pending vaccine doses for this barangay (for stats and badges)
        $pendingDoses = ChildVaccineDose::whereNull('date_given')
            ->whereNotNull('next_due_date')
            ->whereHas('childVaccine.child', fn ($q) => $q->where('barangay', $user->barangay)->where('birthdate', '>=', now()->subMonths(60)))
            ->with(['childVaccine.child:id,barangay'])
            ->cursor()
            ->groupBy('childVaccine.child_id');

        $overdueChildIds = collect([]);
        $upcomingOnlyChildIds = collect([]); // Children with ONLY upcoming (no overdue)
        $mixedChildIds = collect([]); // Children with BOTH overdue AND upcoming

        foreach ($pendingDoses as $childId => $doses) {
            $hasOverdue = $doses->some(fn ($dose) => $dose->next_due_date && $dose->next_due_date->lt($now));
            $hasUpcoming = $doses->some(fn ($dose) => $dose->next_due_date && ! $dose->next_due_date->lt($now));

            if ($hasOverdue && $hasUpcoming) {
                $mixedChildIds->push($childId);
                $overdueChildIds->push($childId); // Add to overdue for filter
            } elseif ($hasOverdue) {
                $overdueChildIds->push($childId);
            } else {
                $upcomingOnlyChildIds->push($childId);
            }
        }

        $overdueCount = $overdueChildIds->count();
        $upcomingCount = $upcomingOnlyChildIds->count();
        $mixedCount = $mixedChildIds->count();

        // Get all pending vitamin doses for this barangay (for stats and badges)
        $pendingVitaminDoses = ChildVitaminDose::whereNull('date_given')
            ->whereNotNull('next_due_date')
            ->whereHas('childVitamin.child', fn ($q) => $q->where('barangay', $user->barangay)->where('birthdate', '>=', now()->subMonths(60)))
            ->with(['childVitamin.child:id,barangay'])
            ->cursor()
            ->groupBy('childVitamin.child_id');

        $vitaminOverdueChildIds = collect([]);
        $vitaminUpcomingChildIds = collect([]);

        foreach ($pendingVitaminDoses as $childId => $doses) {
            $hasOverdue = $doses->some(fn ($dose) => $dose->next_due_date && $dose->next_due_date->lt($now));
            $hasUpcoming = $doses->some(fn ($dose) => $dose->next_due_date && ! $dose->next_due_date->lt($now));

            if ($hasOverdue) {
                $vitaminOverdueChildIds->push($childId);
            }
            if ($hasUpcoming) {
                $vitaminUpcomingChildIds->push($childId);
            }
        }

        $vitaminOverdueCount = $vitaminOverdueChildIds->count();
        $vitaminUpcomingCount = $vitaminUpcomingChildIds->count();

        $avgBmi = Child::where('barangay', $user->barangay)
            ->where('birthdate', '>=', now()->subMonths(60))
            ->whereNotNull('weight')
            ->whereNotNull('height')
            ->where('weight', '>', 0)
            ->where('height', '>', 0)
            ->selectRaw('AVG(CASE WHEN height > 0 THEN weight * 10000.0 / (height * height) ELSE NULL END) as avg_bmi')
            ->value('avg_bmi');

        $stats = [
            'total' => Child::where('barangay', $user->barangay)->where('birthdate', '>=', now()->subMonths(60))->count(),
            'male' => Child::where('barangay', $user->barangay)->where('birthdate', '>=', now()->subMonths(60))->where('sex', 'Male')->count(),
            'female' => Child::where('barangay', $user->barangay)->where('birthdate', '>=', now()->subMonths(60))->where('sex', 'Female')->count(),
            'avgBMI' => number_format($avgBmi ?? 0, 1),
            'vaccine_overdue' => $overdueCount,
            'vaccine_upcoming' => $upcomingCount,
            'vaccine_mixed' => $mixedCount,
            'vitamin_overdue' => $vitaminOverdueCount,
            'vitamin_upcoming' => $vitaminUpcomingCount,
        ];

        return Inertia::render('Children/Index', [
            'children' => $children->map(fn ($child) => [
                'id' => $child->id,
                'slug' => $child->slug,
                'fullname' => $child->fullname,
                'first_name' => $child->first_name,
                'middle_initial' => $child->middle_initial,
                'last_name' => $child->last_name,
                'sex' => $child->sex,
                'age' => $child->age,
                'is_over_60_months' => $child->is_over_60_months,
                'weight' => $child->weight,
                'height' => $child->height,
                'created_by' => $child->creator?->name,
                'birthdate' => $child->birthdate,
                'address' => $child->address,
                'contact_number' => $child->contact_number,
                'latest_weight' => $child->latestHealthlog?->weight,
                'latest_height' => $child->latestHealthlog?->height,
                'latest_bmi' => $child->latestHealthlog?->bmi,
                'latest_nutrition_status' => $child->latestHealthlog?->nutrition_status,

                'creator' => [
                    'name' => $child->creator?->name,
                ],
                'vaccine_alert' => $mixedChildIds->contains($child->id)
                    ? 'mixed'
                    : ($overdueChildIds->contains($child->id)
                        ? 'overdue'
                        : ($upcomingOnlyChildIds->contains($child->id) ? 'upcoming' : null)),
                'vitamin_alert' => $vitaminOverdueChildIds->contains($child->id)
                    ? 'overdue'
                    : ($vitaminUpcomingChildIds->contains($child->id) ? 'upcoming' : null),
            ]),
            'pagination' => [
                'current_page' => $children->currentPage(),
                'last_page' => $children->lastPage(),
                'total' => $children->total(),
                'from' => $children->firstItem(),
                'to' => $children->lastItem(),
            ],
            'stats' => $stats,
            'search' => $request->search,
            'sex' => $request->sex,
            'vaccine_status' => $vaccineStatus,
            'vitamin_status' => $vitaminStatus,
            'view' => $request->query('view', 'card'),
        ]);
    }

    public function archived()
    {
        $user = auth()->user();
        $barangay = $user->barangay;

        $deletedChildren = Child::onlyTrashed()
            ->where('barangay', $barangay)
            ->with(['creator', 'updater'])
            ->get()
            ->map(fn ($child) => [
                'id' => $child->id,
                'slug' => $child->slug,
                'fullname' => $child->fullname,
                'first_name' => $child->first_name,
                'middle_initial' => $child->middle_initial,
                'last_name' => $child->last_name,
                'sex' => $child->sex,
                'age' => $child->age,
                'deleted_at' => $child->deleted_at,
            ]);

        $overagedChildren = Child::where('barangay', $barangay)
            ->where('birthdate', '<=', now()->subMonths(60))
            ->whereNull('deleted_at')
            ->with(['creator', 'updater'])
            ->get()
            ->map(fn ($child) => [
                'id' => $child->id,
                'slug' => $child->slug,
                'fullname' => $child->fullname,
                'first_name' => $child->first_name,
                'middle_initial' => $child->middle_initial,
                'last_name' => $child->last_name,
                'sex' => $child->sex,
                'age' => $child->age,
                'weight' => $child->weight,
                'height' => $child->height,
                'bmi' => $child->bmi,
                'birthdate' => $child->birthdate?->format('Y-m-d'),
                'address' => $child->address,
                'contact_number' => $child->contact_number,
            ]);

        return Inertia::render('Children/Archived', [
            'deleted' => $deletedChildren,
            'overaged' => $overagedChildren,
        ]);
    }

    public function export(Request $request)
    {
        $user = auth()->user();
        $now = Carbon::now();

        $query = Child::where('barangay', $user->barangay);

        //  Search filter (matches index)
        if ($request->search) {
            $search = $request->search;
            if (is_numeric($search)) {
                $minBirthdate = now()->subMonths($search)->toDateString();
                $query->where('birthdate', '<=', $minBirthdate);
            } else {
                $query->where(function ($q) use ($search) {
                    $searchLower = strtolower($search);
                    $q->where(function ($wq) use ($search) {
                        $words = explode(' ', $search);
                        foreach ($words as $word) {
                            $wq->where(function ($xq) use ($word) {
                                $xq->where('first_name', 'like', "%{$word}%")
                                    ->orWhere('last_name', 'like', "%{$word}%");
                            });
                        }
                    })
                        ->orWhereRaw('LOWER(sex) = ?', [$searchLower]);
                });
            }
        }

        //  Sex filter
        if ($request->sex) {
            $query->where('sex', $request->sex);
        }

        //  Vaccine status filter
        $vaccineStatus = $request->vaccine_status;

        if ($vaccineStatus === 'overdue') {
            $overdueChildIds = ChildVaccineDose::select('cv.child_id')
                ->join('child_vaccines as cv', 'child_vaccine_doses.child_vaccine_id', '=', 'cv.id')
                ->whereNull('child_vaccine_doses.date_given')
                ->whereNotNull('child_vaccine_doses.next_due_date')
                ->where('child_vaccine_doses.next_due_date', '<', $now->toDateString())
                ->pluck('cv.child_id');
            $query->whereIn('id', $overdueChildIds);
        } elseif ($vaccineStatus === 'mixed') {
            // Show children with BOTH overdue AND upcoming doses
            $mixedChildIds = ChildVaccineDose::select('cv.child_id')
                ->join('child_vaccines as cv', 'child_vaccine_doses.child_vaccine_id', '=', 'cv.id')
                ->whereNull('child_vaccine_doses.date_given')
                ->whereNotNull('child_vaccine_doses.next_due_date')
                ->where('child_vaccine_doses.next_due_date', '<', $now->toDateString());

            $query->whereIn('id', $mixedChildIds)
                ->whereExists(function ($q) use ($now) {
                    $q->select(DB::raw(1))
                        ->from('child_vaccine_doses as cvd2')
                        ->join('child_vaccines as cv2', 'cvd2.child_vaccine_id', '=', 'cv2.id')
                        ->whereColumn('cv2.child_id', 'children.id')
                        ->whereNull('cvd2.date_given')
                        ->whereNotNull('cvd2.next_due_date')
                        ->where('cvd2.next_due_date', '>=', $now->toDateString());
                });
        } elseif ($vaccineStatus === 'upcoming') {
            $overdueChildIds = ChildVaccineDose::select('cv.child_id')
                ->join('child_vaccines as cv', 'child_vaccine_doses.child_vaccine_id', '=', 'cv.id')
                ->whereNull('child_vaccine_doses.date_given')
                ->whereNotNull('child_vaccine_doses.next_due_date')
                ->where('child_vaccine_doses.next_due_date', '<', $now->toDateString())
                ->pluck('cv.child_id');
            $upcomingOnlyChildIds = ChildVaccineDose::select('cv.child_id')
                ->join('child_vaccines as cv', 'child_vaccine_doses.child_vaccine_id', '=', 'cv.id')
                ->whereNull('child_vaccine_doses.date_given')
                ->whereNotNull('child_vaccine_doses.next_due_date')
                ->where('child_vaccine_doses.next_due_date', '>=', $now->toDateString())
                ->whereNotIn('cv.child_id', $overdueChildIds)
                ->pluck('cv.child_id');
            $query->whereIn('id', $upcomingOnlyChildIds);
        }

        //  Age filters
        if ($request->age_min) {
            $minBirthdate = now()->subMonths($request->age_min)->toDateString();
            $query->where('birthdate', '<=', $minBirthdate);
        }

        if ($request->age_max) {
            $maxBirthdate = now()->subMonths($request->age_max + 1)->addDay()->toDateString();
            $query->where('birthdate', '<', $maxBirthdate);
        }

        // Overaged export
        if ($request->type === 'overaged') {
            $query->where('birthdate', '<=', now()->subMonths(60))
                ->whereNull('deleted_at');
        } else {
            $query->where('birthdate', '>', now()->subMonths(60));
        }

        return $this->exportCSV($query->cursor());
    }

    public function create()
    {
        return Inertia::render('Children/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'middle_initial' => 'nullable|string|max:5',
            'last_name' => 'required|string|max:255',
            'sex' => 'required|in:M,F,Male,Female',
            'birthdate' => 'required|date|before:tomorrow',
            'address' => 'nullable|string|max:255',
            'contact_number' => 'nullable|string|max:50',
            'weight' => 'nullable|numeric|min:0.1|max:200',
            'height' => 'nullable|numeric|min:0.1|max:250',
        ]);

        $user = auth()->user();

        /** @var Child|null $existing */
        $existing = Child::where('barangay', $user->barangay)
            ->where('first_name', $validated['first_name'])
            ->where('last_name', $validated['last_name'])
            ->where('birthdate', $validated['birthdate'])
            ->first();

        if ($existing) {
            return back()->withErrors([
                'first_name' => 'A child with this name and birthdate already exists in your barangay.',
            ])->withInput();
        }

        // ✅ Normalize sex
        $validated['sex'] = in_array(strtoupper($validated['sex']), ['M', 'MALE']) ? 'Male' : 'Female';

        // Format phone number
        if (! empty($validated['contact_number'])) {
            $validated['contact_number'] = trim($validated['contact_number']);
        }

        DB::transaction(function () use ($validated, $user) {
            $child = Child::create([
                'first_name' => $validated['first_name'],
                'middle_initial' => $validated['middle_initial'] ?? null,
                'last_name' => $validated['last_name'],
                'sex' => $validated['sex'],
                'birthdate' => $validated['birthdate'],
                'address' => $validated['address'] ?? null,
                'contact_number' => $validated['contact_number'] ?? null,
                'weight' => $validated['weight'] ?? null,
                'height' => $validated['height'] ?? null,
                'created_by' => $user->id,
                'updated_by' => $user->id,
                'barangay' => $user->barangay,
            ]);

            if (! empty($validated['weight']) && ! empty($validated['height'])) {
                $evaluation = GrowthHelper::evaluateChild(
                    $validated['sex'],
                    $validated['birthdate'],
                    $validated['weight'],
                    $validated['height'],
                );

                $overall = $evaluation['overall'] ?? 'Normal';

                HealthLog::create([
                    'child_id' => $child->id,
                    'user_id' => $user->id,
                    'age_in_months' => $evaluation['age_months'],
                    'weight' => $validated['weight'],
                    'height' => $validated['height'],
                    'bmi' => $evaluation['bmi'],
                    'status_wfa' => $evaluation['status_wfa'],
                    'status_lfa' => $evaluation['status_lfa'],
                    'status_wfl_wfh' => $evaluation['status_wfl_wfh'],
                    'nutrition_status' => $overall,
                    'recommendation' => AIRecommender::getRecommendation(
                        $overall,
                        $validated['sex'],
                        $evaluation['age_months'] ?? 0,
                        null,
                        null,
                        $child->id,
                    ),
                ]);

                $child->update([
                    'nutrition_status' => $overall,
                    'updated_by' => $user->id,
                ]);
            }

            RefreshDashboardForBarangay::dispatch($user->barangay)
                ->delay(now()->addSeconds(10));
        });

        return redirect()->route('children.index')->with('success', 'Child added successfully!');
    }

    public function destroyNote(Child $child, $noteId)
    {
        $note = $child->notes()->findOrFail($noteId);

        $user = auth()->user();

        if ($note->user_id !== $user->id && ! $user->hasRole('Admin')) {
            abort(403);
        }

        $child->abortIfOveraged();

        $note->delete();

        return redirect()->back()->with('success', 'Note deleted successfully.');
    }

    public function exportCSV($children)
    {
        $filename = 'children_export_'.now()->format('Y-m-d').'.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=$filename",
        ];

        $callback = function () use ($children) {
            $file = fopen('php://output', 'w');

            fputcsv($file, [
                'ID',
                'Full Name',
                'Age (months)',
                'Sex',
                'Birthdate',
                'Weight (kg)',
                'Height (cm)',
                'Nutrition Status',
                'Address',
                'Contact Number',
            ]);

            foreach ($children as $child) {
                fputcsv($file, [
                    $child->id,
                    $child->fullname,
                    $child->age,
                    $child->sex,
                    $child->birthdate?->format('Y-m-d'),
                    $child->weight,
                    $child->height,
                    $child->nutrition_status,
                    $child->address,
                    $child->contact_number,
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function edit(Child $child)
    {
        $user = auth()->user();

        if ($child->barangay !== $user->barangay) {
            abort(403);
        }

        $child->abortIfOveraged();

        return Inertia::render('Children/Edit', [
            'child' => [
                'id' => $child->id,
                'slug' => $child->slug,
                'first_name' => $child->first_name,
                'middle_initial' => $child->middle_initial,
                'last_name' => $child->last_name,
                'sex' => $child->sex,
                'birthdate' => $child->birthdate?->format('Y-m-d'),
                'contact_number' => $child->contact_number,
                'weight' => $child->weight,
                'height' => $child->height,
            ],
        ]);
    }

    public function update(Request $request, Child $child)
    {
        $user = auth()->user();

        if ($child->barangay !== $user->barangay) {
            abort(403);
        }

        $child->abortIfOveraged();

        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'middle_initial' => 'nullable|string|max:5',
            'last_name' => 'required|string|max:255',
            'sex' => 'required|in:Male,Female',
            'birthdate' => 'required|date|before:tomorrow',
            'contact_number' => 'nullable|string|max:50',
            'weight' => 'nullable|numeric|min:0.1|max:200',
            'height' => 'nullable|numeric|min:0.1|max:250',
        ]);

        DB::transaction(function () use ($validated, $child) {
            $oldWeight = $child->weight;
            $oldHeight = $child->height;

            $child->update(array_merge(
                $validated,
                ['updated_by' => auth()->id()]
            ));

            $newWeight = $validated['weight'] ?? null;
            $newHeight = $validated['height'] ?? null;

            // Auto-create health log if weight or height changed and both are present
            if (($oldWeight != $newWeight || $oldHeight != $newHeight) && $newWeight && $newHeight) {
                $evaluation = GrowthHelper::evaluateChild(
                    $child->sex,
                    $child->birthdate,
                    $newWeight,
                    $newHeight,
                );

                $overall = $evaluation['overall'] ?? 'Normal';

                HealthLog::create([
                    'child_id' => $child->id,
                    'user_id' => auth()->id(),
                    'age_in_months' => $evaluation['age_months'],
                    'weight' => $newWeight,
                    'height' => $newHeight,
                    'bmi' => $evaluation['bmi'],
                    'status_wfa' => $evaluation['status_wfa'],
                    'status_lfa' => $evaluation['status_lfa'],
                    'status_wfl_wfh' => $evaluation['status_wfl_wfh'],
                    'nutrition_status' => $overall,
                    'recommendation' => AIRecommender::getRecommendation(
                        $overall,
                        $child->sex,
                        $evaluation['age_months'] ?? 0,
                        null,
                        null,
                        $child->id,
                    ),
                ]);
            }

            RefreshDashboardForBarangay::dispatch($child->barangay)
                ->delay(now()->addSeconds(10));
        });

        return redirect()->route('children.show', $child->id)->with('success', 'Child updated successfully!');
    }

    public function destroy(Child $child)
    {
        $user = auth()->user();

        if ($child->barangay !== $user->barangay) {
            abort(403);
        }

        $barangay = $child->barangay;
        $child->delete();

        RefreshDashboardForBarangay::dispatch($barangay)
            ->delay(now()->addSeconds(10));

        return redirect()->route('children.index')->with('success', 'Child deleted successfully!');
    }

    /**
     * Display the specified child with health logs and vaccine records.
     */
    public function show(Child $child)
    {
        $user = auth()->user();

        if ($child->barangay !== $user->barangay) {
            abort(403);
        }

        $child->load(['notes.author', 'creator', 'updater']);

        $selectColumns = [
            'id', 'weight', 'height', 'bmi', 'nutrition_status',
            'status_wfa', 'status_lfa', 'status_wfl_wfh',
            'vitamin_a', 'deworming',
            'micronutrient_powder', 'ruf', 'rusf', 'complementary_food',
            'created_at', 'user_id',
        ];

        $logMapper = fn ($log) => [
            'id' => $log->id,
            'weight' => $log->weight,
            'height' => $log->height,
            'bmi' => $log->bmi,
            'nutrition_status' => $log->nutrition_status,
            'status_wfa' => $log->status_wfa,
            'status_lfa' => $log->status_lfa,
            'status_wfl_wfh' => $log->status_wfl_wfh,
            'vitamin_a' => $log->vitamin_a,
            'deworming' => $log->deworming,
            'micronutrient_powder' => $log->micronutrient_powder,
            'rutf' => $log->ruf,
            'rusf' => $log->rusf,
            'complementary_food' => $log->complementary_food,
            'created_at' => $log->created_at,
            'user' => ['name' => $log->user?->name],
        ];

        return Inertia::render('Children/Show', [
            'child' => [
                'id' => $child->id,
                'slug' => $child->slug,
                'fullname' => $child->fullname,
                'first_name' => $child->first_name,
                'middle_initial' => $child->middle_initial,
                'last_name' => $child->last_name,
                'sex' => $child->sex,
                'age' => $child->age,
                'is_over_60_months' => $child->is_over_60_months,
                'weight' => $child->weight,
                'height' => $child->height,
                'birthdate' => $child->birthdate,
                'address' => $child->address,
                'contact_number' => $child->contact_number,
                'created_at' => $child->created_at,
                'updated_at' => $child->updated_at,
                'creator' => ['name' => $child->creator?->name],
                'updater' => ['name' => $child->updater?->name],
                'notes' => $child->notes->map(fn ($note) => [
                    'id' => $note->id,
                    'note' => $note->note,
                    'author' => ['name' => $note->author?->name],
                    'created_at' => $note->created_at,
                ]),
            ],
            'chartHealthLogs' => $child->healthlogs()
                ->orderBy('created_at', 'asc')
                ->take(12)
                ->get($selectColumns)
                ->map($logMapper),
            'healthlogs' => $child->healthlogs()
                ->with('user:id,name')
                ->orderBy('created_at', 'desc')
                ->paginate(10, $selectColumns)
                ->through($logMapper),
        ]);
    }

    /**
     * Restore a soft-deleted child.
     */
    public function restore($id)
    {
        $user = auth()->user();
        $child = Child::onlyTrashed()->where('barangay', $user->barangay)->find($id);

        if (! $child) {
            return redirect()->route('children.archived')->with('error', 'Record no longer exists or was already restored.');
        }

        $child->restore();

        RefreshDashboardForBarangay::dispatch($child->barangay)
            ->delay(now()->addSeconds(10));

        return redirect()->route('children.index')->with('success', 'Child restored successfully!');
    }

    /**
     * Permanently delete a child.
     */
    public function forceDelete($id)
    {
        $user = auth()->user();
        $child = Child::onlyTrashed()->where('barangay', $user->barangay)->find($id);

        if (! $child) {
            return redirect()->route('children.archived')->with('error', 'Record no longer exists or was already deleted.');
        }

        $child->forceDelete();

        RefreshDashboardForBarangay::dispatch($child->barangay)
            ->delay(now()->addSeconds(10));

        return redirect()->route('children.archived')->with('success', 'Child permanently deleted!');
    }

    /**
     * Store a new note for a child.
     */
    public function storeNote(Request $request, Child $child)
    {
        $user = auth()->user();

        if ($child->barangay !== $user->barangay) {
            abort(403);
        }

        $child->abortIfOveraged();

        $request->validate([
            'note' => 'required|string|max:1000',
        ]);

        $child->notes()->create([
            'note' => $request->note,
            'user_id' => $user->id,
        ]);

        return redirect()->back()->with('success', 'Note added successfully!');
    }

    /**
     * Import children from Excel/CSV.
     */
    public function import(Request $request)
    {
        $user = auth()->user();

        $rows = $request->input('data');

        if (! $rows || ! is_array($rows)) {
            return back()->with('error', 'Invalid import data.');
        }

        $imported = 0;
        $skipped = 0;
        $withoutHealthLog = 0;
        $failures = 0;

        $existingMap = Child::where('barangay', $user->barangay)
            ->get()
            ->keyBy(fn ($c) => strtolower($c->first_name).'|'.strtolower($c->last_name).'|'.($c->birthdate ? $c->birthdate->format('Y-m-d') : ''));

        foreach ($rows as $row) {
            if (empty($row['first_name']) || empty($row['last_name']) || empty($row['sex'])) {
                continue;
            }

            $normalizedSex = strtoupper(trim($row['sex']));
            if (! in_array($normalizedSex, ['M', 'MALE', 'F', 'FEMALE'], true)) {
                $skipped++;

                continue;
            }

            $dupeKey = strtolower($row['first_name']).'|'.strtolower($row['last_name']).'|'.($row['birthdate'] ?? '');
            if ($existingMap->has($dupeKey)) {
                $skipped++;

                continue;
            }

            $sex = $normalizedSex === 'M' || $normalizedSex === 'MALE' ? 'Male' : 'Female';

            $weight = isset($row['weight']) && is_numeric($row['weight']) ? floatval($row['weight']) : 0;
            $height = isset($row['height']) && is_numeric($row['height']) ? floatval($row['height']) : 0;
            $hasAnthropometricData = $weight > 0 && $height > 0 && ! empty($row['birthdate']);

            try {
                DB::transaction(function () use ($row, $user, $sex, $weight, $height, $hasAnthropometricData, &$imported, &$withoutHealthLog) {
                    $child = Child::create([
                        'first_name' => $row['first_name'],
                        'middle_initial' => $row['middle_initial'] ?? null,
                        'last_name' => $row['last_name'],
                        'sex' => $sex,
                        'weight' => $weight ?: 0,
                        'height' => $height ?: 0,
                        'birthdate' => $row['birthdate'] ?? null,
                        'barangay' => $user->barangay,
                        'created_by' => $user->id,
                        'address' => $row['address'] ?? null,
                        'contact_number' => null,
                    ]);

                    if ($hasAnthropometricData) {
                        $evaluation = GrowthHelper::evaluateChild(
                            $sex,
                            $row['birthdate'],
                            $weight,
                            $height
                        );

                        $overall = $evaluation['overall'] ?? 'Normal';

                        HealthLog::create([
                            'child_id' => $child->id,
                            'user_id' => $user->id,
                            'age_in_months' => $evaluation['age_months'],
                            'weight' => $weight,
                            'height' => $height,
                            'bmi' => $evaluation['bmi'],
                            'status_wfa' => $evaluation['status_wfa'],
                            'status_lfa' => $evaluation['status_lfa'],
                            'status_wfl_wfh' => $evaluation['status_wfl_wfh'],
                            'nutrition_status' => $overall,
                            'recommendation' => AIRecommender::getRecommendation(
                                $overall,
                                $sex,
                                $evaluation['age_months'] ?? 0,
                                null,
                                null,
                                $child->id,
                            ),
                        ]);

                        $child->update([
                            'nutrition_status' => $overall,
                            'updated_by' => $user->id,
                        ]);
                    } else {
                        $withoutHealthLog++;
                    }

                    $imported++;
                });
            } catch (\Throwable $e) {
                Log::error('Failed to import child row', [
                    'row' => $row,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);
                $failures++;
            }
        }

        RefreshDashboardForBarangay::dispatch($user->barangay)
            ->delay(now()->addSeconds(10));

        $message = "Import complete! {$imported} children imported.";
        if ($withoutHealthLog > 0) {
            $message .= " {$withoutHealthLog} child(ren) created without health evaluation (missing weight, height, or birthdate).";
        }
        if ($failures > 0) {
            $message .= " {$failures} row(s) failed and were rolled back.";
        }
        if ($skipped > 0) {
            $message .= " {$skipped} duplicates skipped.";
        }

        return redirect('/children')->with('success', $message);
    }

    /**
     * Print view for filtered children list.
     */
    public function print(Request $request)
    {
        $user = auth()->user();
        $now = Carbon::now();

        $query = Child::where('barangay', $user->barangay);

        if ($request->search) {
            $search = $request->search;
            if (is_numeric($search)) {
                $minBirthdate = now()->subMonths($search)->toDateString();
                $query->where('birthdate', '<=', $minBirthdate);
            } else {
                $query->where(function ($q) use ($search) {
                    $searchLower = strtolower($search);
                    $q->where(function ($wq) use ($search) {
                        $words = explode(' ', $search);
                        foreach ($words as $word) {
                            $wq->where(function ($xq) use ($word) {
                                $xq->where('first_name', 'like', "%{$word}%")
                                    ->orWhere('last_name', 'like', "%{$word}%");
                            });
                        }
                    })
                        ->orWhereRaw('LOWER(sex) = ?', [$searchLower]);
                });
            }
        }

        if ($request->sex) {
            $query->where('sex', $request->sex);
        }

        $vaccineStatus = $request->vaccine_status;

        if ($vaccineStatus === 'overdue') {
            $overdueChildIds = ChildVaccineDose::select('cv.child_id')
                ->join('child_vaccines as cv', 'child_vaccine_doses.child_vaccine_id', '=', 'cv.id')
                ->whereNull('child_vaccine_doses.date_given')
                ->whereNotNull('child_vaccine_doses.next_due_date')
                ->where('child_vaccine_doses.next_due_date', '<', $now->toDateString())
                ->pluck('cv.child_id');
            $query->whereIn('id', $overdueChildIds);
        } elseif ($vaccineStatus === 'upcoming') {
            $overdueChildIds = ChildVaccineDose::select('cv.child_id')
                ->join('child_vaccines as cv', 'child_vaccine_doses.child_vaccine_id', '=', 'cv.id')
                ->whereNull('child_vaccine_doses.date_given')
                ->whereNotNull('child_vaccine_doses.next_due_date')
                ->where('child_vaccine_doses.next_due_date', '<', $now->toDateString())
                ->pluck('cv.child_id');
            $upcomingChildIds = ChildVaccineDose::select('cv.child_id')
                ->join('child_vaccines as cv', 'child_vaccine_doses.child_vaccine_id', '=', 'cv.id')
                ->whereNull('child_vaccine_doses.date_given')
                ->whereNotNull('child_vaccine_doses.next_due_date')
                ->where('child_vaccine_doses.next_due_date', '>=', $now->toDateString())
                ->whereNotIn('cv.child_id', $overdueChildIds)
                ->pluck('cv.child_id');
            $query->whereIn('id', $upcomingChildIds);
        }

        // Overaged print
        if ($request->type === 'overaged') {
            $query->where('birthdate', '<=', now()->subMonths(60))
                ->whereNull('deleted_at');
        } else {
            $query->where('birthdate', '>', now()->subMonths(60));
        }

        $children = $query->cursor()->map(fn ($child) => [
            'id' => $child->id,
            'fullname' => $child->fullname,
            'first_name' => $child->first_name,
            'last_name' => $child->last_name,
            'sex' => $child->sex,
            'age' => $child->age,
            'birthdate' => $child->birthdate?->format('Y-m-d'),
            'weight' => $child->weight,
            'height' => $child->height,
            'nutrition_status' => $child->nutrition_status,
            'address' => $child->address,
            'contact_number' => $child->contact_number,
        ]);

        return Inertia::render('Children/Print', [
            'children' => $children,
            'filters' => $request->only(['search', 'sex', 'vaccine_status']),
            'generated_at' => now()->format('Y-m-d H:i:s'),
            'type' => $request->type,
        ]);
    }

    /**
     * Print view for single child profile.
     */
    public function showPrint(Child $child)
    {
        $user = auth()->user();

        if ($child->barangay !== $user->barangay) {
            abort(403);
        }

        $child->abortIfOveraged();

        $child->load(['healthlogs' => fn ($q) => $q->orderBy('created_at', 'asc')]);

        return Inertia::render('Children/ShowPrint', [
            'child' => [
                'id' => $child->id,
                'slug' => $child->slug,
                'fullname' => $child->fullname,
                'first_name' => $child->first_name,
                'middle_initial' => $child->middle_initial,
                'last_name' => $child->last_name,
                'sex' => $child->sex,
                'age' => $child->age,
                'birthdate' => $child->birthdate?->format('Y-m-d'),
                'weight' => $child->weight,
                'height' => $child->height,
                'nutrition_status' => $child->nutrition_status,
                'bmi' => $child->bmi,
                'address' => $child->address,
                'contact_number' => $child->contact_number,
                'created_at' => $child->created_at?->format('Y-m-d H:i:s'),
                'healthlogs' => $child->healthlogs->map(fn ($log) => [
                    'weight' => $log->weight,
                    'height' => $log->height,
                    'bmi' => $log->bmi,
                    'nutrition_status' => $log->nutrition_status,
                    'vitamin_a' => $log->vitamin_a,
                    'deworming' => $log->deworming,
                    'micronutrient_powder' => $log->micronutrient_powder,
                    'rutf' => $log->rutf,
                    'rusf' => $log->rusf,
                    'complementary_food' => $log->complementary_food,
                    'status_wfa' => $log->status_wfa,
                    'status_lfa' => $log->status_lfa,
                    'status_wfl_wfh' => $log->status_wfl_wfh,
                    'created_at' => $log->created_at?->format('Y-m-d'),
                ]),
            ],
            'generated_at' => now()->format('Y-m-d H:i:s'),
        ]);
    }

    /**
     * Export single child profile as CSV including health logs and vaccine history.
     */
    public function exportSingle(Child $child)
    {
        $user = auth()->user();

        if ($child->barangay !== $user->barangay) {
            abort(403);
        }

        $child->abortIfOveraged();

        $child->load(['healthlogs' => fn ($q) => $q->orderBy('created_at', 'asc')]);

        $childVaccines = ChildVaccine::where('child_id', $child->id)
            ->with(['vaccine', 'doses.administeredBy:id,name'])
            ->orderBy('created_at', 'desc')
            ->get();

        $childVitamins = ChildVitamin::where('child_id', $child->id)
            ->with(['vitamin', 'doses.administeredBy:id,name'])
            ->orderBy('created_at', 'desc')
            ->get();

        $filename = 'child_'.$child->id.'_export_'.now()->format('Y-m-d').'.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=utf-8',
            'Content-Disposition' => "attachment; filename=$filename",
        ];

        $callback = function () use ($child, $childVaccines, $childVitamins) {
            $file = fopen('php://output', 'w');

            // UTF-8 BOM for Excel compatibility
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));

            // ── Section 1: Child Information ──
            fputcsv($file, ['Child Information']);
            fputcsv($file, [
                'ID', 'Full Name', 'Age (months)', 'Sex', 'Birthdate',
                'Address', 'Contact Number',
                'Weight (kg)', 'Height (cm)', 'Nutrition Status',
            ]);
            fputcsv($file, [
                $child->id,
                $child->fullname,
                $child->age,
                $child->sex,
                $child->birthdate?->format('Y-m-d'),
                $child->address,
                $child->contact_number,
                $child->weight,
                $child->height,
                $child->nutrition_status,
            ]);

            // Blank separator row
            fputcsv($file, []);

            // ── Section 2: Health Logs ──
            fputcsv($file, ['Health Logs']);
            fputcsv($file, [
                'ID', 'Date', 'Weight (kg)', 'Height (cm)',
                'Nutrition Status', 'WFA', 'LFA', 'WFL/WFH',
                'Vitamin A', 'Deworming', 'MNP',
                'RUTF', 'RUSF', 'Complementary Food',
                'Created By',
            ]);

            if ($child->healthlogs->isEmpty()) {
                fputcsv($file, ['No health logs recorded.']);
            } else {
                foreach ($child->healthlogs as $log) {
                    fputcsv($file, [
                        $log->id,
                        $log->created_at?->format('Y-m-d'),
                        $log->weight,
                        $log->height,
                        $log->nutrition_status,
                        $log->status_wfa,
                        $log->status_lfa,
                        $log->status_wfl_wfh,
                        $log->vitamin_a ? 'Yes' : 'No',
                        $log->deworming ? 'Yes' : 'No',
                        $log->micronutrient_powder ? 'Yes' : 'No',
                        $log->ruf ?? '-',
                        $log->rusf ?? '-',
                        $log->complementary_food ?? '-',
                        $log->user?->name ?? '-',
                    ]);
                }
            }

            // Blank separator row
            fputcsv($file, []);

            // ── Section 3: Vaccine History ──
            fputcsv($file, ['Vaccine History']);
            fputcsv($file, [
                'Vaccine Name', 'Dose #', 'Date Given',
                'Next Due Date', 'Status', 'Administered By', 'Remarks',
            ]);

            if ($childVaccines->isEmpty()) {
                fputcsv($file, ['No vaccines recorded.']);
            } else {
                foreach ($childVaccines as $cv) {
                    if ($cv->doses->isEmpty()) {
                        fputcsv($file, [
                            $cv->vaccine?->name ?? '-',
                            '—',
                            '—',
                            '—',
                            'Not Started',
                            '—',
                            '—',
                        ]);
                    } else {
                        foreach ($cv->doses as $dose) {
                            fputcsv($file, [
                                $cv->vaccine?->name ?? '-',
                                $dose->dose_number,
                                $dose->date_given?->format('Y-m-d') ?: '—',
                                $dose->next_due_date?->format('Y-m-d') ?: '—',
                                $dose->dose_status,
                                $dose->administeredBy?->name ?? '—',
                                $dose->remarks ?: '—',
                            ]);
                        }
                    }
                }
            }

            // Blank separator row
            fputcsv($file, []);

            // ── Section 4: Vitamin History ──
            fputcsv($file, ['Vitamin History']);
            fputcsv($file, [
                'Vitamin Name', 'Dose #', 'Date Given',
                'Next Due Date', 'Status', 'Administered By', 'Remarks',
            ]);

            if ($childVitamins->isEmpty()) {
                fputcsv($file, ['No vitamins recorded.']);
            } else {
                foreach ($childVitamins as $cvt) {
                    if ($cvt->doses->isEmpty()) {
                        fputcsv($file, [
                            $cvt->vitamin?->name ?? '-',
                            '—',
                            '—',
                            '—',
                            'Not Started',
                            '—',
                            '—',
                        ]);
                    } else {
                        foreach ($cvt->doses as $dose) {
                            fputcsv($file, [
                                $cvt->vitamin?->name ?? '-',
                                $dose->dose_number,
                                $dose->date_given?->format('Y-m-d') ?: '—',
                                $dose->next_due_date?->format('Y-m-d') ?: '—',
                                $dose->dose_status,
                                $dose->administeredBy?->name ?? '—',
                                $dose->remarks ?: '—',
                            ]);
                        }
                    }
                }
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
