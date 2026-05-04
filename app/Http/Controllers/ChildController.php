<?php

namespace App\Http\Controllers;

use App\Models\Child;
use App\Models\ChildVaccineDose;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ChildController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $now = Carbon::now();

        $query = Child::with(['creator', 'updater'])
            ->where('barangay', $user->barangay);

        // Search filter
        if ($request->search) {
            $search = $request->search;

            if (is_numeric($search)) {
                $minBirthdate = now()->subMonths($search)->toDateString();
                $query->where('birthdate', '<=', $minBirthdate);
            } else {
                $query->where(function ($q) use ($search) {
                    $searchLower = strtolower($search);
                    $q->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
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
        } elseif ($vaccineStatus === 'upcoming') {
            // Only show children with upcoming doses who have NO overdue doses
            $upcomingChildIdsQuery = ChildVaccineDose::select('cv.child_id')
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
            $query->whereIn('id', $upcomingChildIdsQuery);
        }

        $children = $query->paginate(25, ['*'], 'page', $request->page ?? 1);

        // Get all pending vaccine doses for this barangay (for stats and badges)
        $pendingDoses = ChildVaccineDose::whereNull('date_given')
            ->whereNotNull('next_due_date')
            ->whereHas('childVaccine.child', fn ($q) => $q->where('barangay', $user->barangay))
            ->with(['childVaccine.child:id,barangay'])
            ->get()
            ->groupBy('childVaccine.child_id');

        $overdueChildIds = collect([]);
        $upcomingChildIds = collect([]);

        foreach ($pendingDoses as $childId => $doses) {
            $hasOverdue = $doses->some(fn ($dose) => $dose->next_due_date && $dose->next_due_date->lt($now));
            if ($hasOverdue) {
                $overdueChildIds->push($childId);
            } else {
                $upcomingChildIds->push($childId);
            }
        }

        $overdueCount = $overdueChildIds->count();
        $upcomingCount = $upcomingChildIds->count();

        $avgBmi = Child::where('barangay', $user->barangay)
            ->whereNotNull('weight')
            ->whereNotNull('height')
            ->where('weight', '>', 0)
            ->where('height', '>', 0)
            ->get()
            ->avg(fn ($c) => $c->bmi ?? 0);

        $stats = [
            'total' => Child::where('barangay', $user->barangay)->count(),
            'male' => Child::where('barangay', $user->barangay)->where('sex', 'Male')->count(),
            'female' => Child::where('barangay', $user->barangay)->where('sex', 'Female')->count(),
            'avgBMI' => number_format($avgBmi ?? 0, 1),
            'vaccine_overdue' => $overdueCount,
            'vaccine_upcoming' => $upcomingCount,
        ];

        return Inertia::render('Children/Index', [
            'children' => $children->map(fn ($child) => [
                'id' => $child->id,
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
                'barangay' => $child->barangay,

                'creator' => [
                    'name' => $child->creator?->name,
                ],
                'vaccine_alert' => $overdueChildIds->contains($child->id)
                    ? 'overdue'
                    : ($upcomingChildIds->contains($child->id) ? 'upcoming' : null),
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
        ]);
    }

    public function archived()
    {
        $user = auth()->user();

        $archivedChildren = Child::onlyTrashed()
            ->where('barangay', $user->barangay)
            ->with(['creator', 'updater'])
            ->get();

        return Inertia::render('Children/Archived', [
            'children' => $archivedChildren->map(fn ($child) => [
                'id' => $child->id,
                'fullname' => $child->fullname,
                'first_name' => $child->first_name,
                'middle_initial' => $child->middle_initial,
                'last_name' => $child->last_name,
                'sex' => $child->sex,
                'age' => $child->age,
                'deleted_at' => $child->deleted_at,
                'barangay' => $child->barangay,
            ]),
        ]);
    }

    public function export(Request $request)
    {
        $user = auth()->user();

        $query = Child::query();

        // 🔒 Healthworker restricted to own barangay
        if (! $user->hasRole('Admin')) {
            $query->where('barangay', $user->barangay);
        }

        // ✅ Barangay filter (both roles can use it)
        if ($request->barangay) {
            if ($user->hasRole('Admin')) {
                $query->where('barangay', $request->barangay);
            } else {
                // Healthworker still limited to their own
                $query->where('barangay', $user->barangay);
            }
        }

        // ✅ Age filters (calculated from birthdate in months)
        if ($request->age_min) {
            $minBirthdate = now()->subMonths($request->age_min)->toDateString();
            $query->where('birthdate', '<=', $minBirthdate);
        }

        if ($request->age_max) {
            $maxBirthdate = now()->subMonths($request->age_max + 1)->addDay()->toDateString();
            $query->where('birthdate', '<', $maxBirthdate);
        }

        $children = $query->get();

        return $this->exportCSV($children);
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
            'birthdate' => 'nullable|date',
            'address' => 'nullable|string|max:255',
            'contact_number' => 'nullable|string|max:50',
            'weight' => 'nullable|numeric|min:0|max:200',
            'height' => 'nullable|numeric|min:0|max:250',
        ]);

        $user = auth()->user();

        // ✅ Normalize sex
        $validated['sex'] = in_array(strtoupper($validated['sex']), ['M', 'MALE']) ? 'Male' : 'Female';

        // Format phone number
        if (! empty($validated['contact_number'])) {
            $validated['contact_number'] = trim($validated['contact_number']);
        }

        Child::create([
            'first_name' => $validated['first_name'],
            'middle_initial' => $validated['middle_initial'] ?? null,
            'last_name' => $validated['last_name'],
            'sex' => $validated['sex'],
            'birthdate' => $validated['birthdate'] ?? null,
            'address' => $validated['address'] ?? null,
            'contact_number' => $validated['contact_number'] ?? null,
            'weight' => $validated['weight'] ?? null,
            'height' => $validated['height'] ?? null,
            'created_by' => $user->id,
            'barangay' => $user->barangay,
        ]);

        return redirect()->route('children.index')->with('success', 'Child added successfully!');
    }

    public function destroyNote(Child $child, $noteId)
    {
        $note = $child->notes()->findOrFail($noteId);

        $user = auth()->user();

        if ($note->user_id !== $user->id && ! $user->hasRole('Admin')) {
            abort(403);
        }

        $note->delete();

        return redirect()->back()->with('success', 'Note deleted successfully.');
    }

    public function exportCSV($children)
    {
        $filename = 'children_export.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=$filename",
        ];

        $callback = function () use ($children) {
            $file = fopen('php://output', 'w');

            fputcsv($file, [
                'Full Name',
                'Age',
                'Barangay',
                'BMI',
            ]);

            foreach ($children as $child) {
                fputcsv($file, [
                    $child->fullname,
                    $child->age,
                    $child->barangay,
                    $child->bmi,
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function edit(Child $child)
    {
        $user = auth()->user();

        // Healthworker can only edit children in their barangay, Admin has full access
        if ($child->barangay !== $user->barangay && ! $user->hasRole('Admin')) {
            abort(403);
        }

        return Inertia::render('Children/Edit', [
            'child' => [
                'id' => $child->id,
                'first_name' => $child->first_name,
                'middle_initial' => $child->middle_initial,
                'last_name' => $child->last_name,
                'sex' => $child->sex,
                'birthdate' => $child->birthdate,
                'barangay' => $child->barangay,
                'contact_number' => $child->contact_number,
                'weight' => $child->weight,
                'height' => $child->height,
            ],
        ]);
    }

    public function update(Request $request, Child $child)
    {
        $user = auth()->user();

        // Healthworker can only update children in their barangay, Admin has full access
        if ($child->barangay !== $user->barangay && ! $user->hasRole('Admin')) {
            abort(403);
        }

        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'middle_initial' => 'nullable|string|max:5',
            'last_name' => 'required|string|max:255',
            'sex' => 'required|in:Male,Female',
            'birthdate' => 'nullable|date',
            'barangay' => 'nullable|string|max:255',
            'contact_number' => 'nullable|string|max:50',
            'weight' => 'nullable|numeric|min:0|max:200',
            'height' => 'nullable|numeric|min:0|max:250',
        ]);

        $child->update(array_merge(
            $request->only([
                'first_name', 'middle_initial', 'last_name',
                'sex', 'birthdate', 'barangay', 'contact_number',
                'weight', 'height',
            ]),
            ['updated_by' => auth()->id()]
        ));

        return redirect()->route('children.show', $child->id)->with('success', 'Child updated successfully!');
    }

    public function destroy(Child $child)
    {
        $user = auth()->user();

        // Healthworker can only delete children in their barangay, Admin has full access
        if ($child->barangay !== $user->barangay && ! $user->hasRole('Admin')) {
            abort(403);
        }

        $child->delete();

        return redirect()->route('children.index')->with('success', 'Child deleted successfully!');
    }

    /**
     * Display the specified child with health logs and vaccine records.
     */
    public function show(Child $child)
    {
        $user = auth()->user();

        // Healthworker can only view children in their barangay, Admin has full access
        if ($child->barangay !== $user->barangay && ! $user->hasRole('Admin')) {
            abort(403);
        }

        $child->load(['notes.author', 'creator', 'updater']);

        return Inertia::render('Children/Show', [
            'child' => [
                'id' => $child->id,
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
                'barangay' => $child->barangay,
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
                'healthlogs' => $child->healthlogs()
                    ->with('user:id,name')
                    ->orderBy('created_at', 'asc')
                    ->get([
                        'id', 'weight', 'height', 'bmi', 'nutrition_status',
                        'status_wfa', 'status_lfa', 'status_wfl_wfh',
                        'vitamin_a', 'deworming',
                        'micronutrient_powder', 'ruf', 'rusf', 'complementary_food',
                        'vaccine_name', 'dose_number', 'date_given', 'next_due_date', 'vaccine_status',
                        'created_at', 'user_id',
                    ])
                    ->map(fn ($log) => [
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
                        'vaccine_name' => $log->vaccine_name,
                        'dose_number' => $log->dose_number,
                        'date_given' => $log->date_given,
                        'next_due_date' => $log->next_due_date,
                        'vaccine_status' => $log->vaccine_status,
                        'created_at' => $log->created_at,
                        'user' => ['name' => $log->user?->name],
                    ]),
            ],
        ]);
    }

    /**
     * Restore a soft-deleted child.
     */
    public function restore($id)
    {
        $user = auth()->user();
        $child = Child::onlyTrashed()->findOrFail($id);

        // Healthworker can only restore children in their barangay, Admin has full access
        if ($child->barangay !== $user->barangay && ! $user->hasRole('Admin')) {
            abort(403);
        }

        $child->restore();

        return redirect()->route('children.index')->with('success', 'Child restored successfully!');
    }

    /**
     * Permanently delete a child.
     */
    public function forceDelete($id)
    {
        $user = auth()->user();
        $child = Child::onlyTrashed()->findOrFail($id);

        // Healthworker can only force-delete children in their barangay, Admin has full access
        if ($child->barangay !== $user->barangay && ! $user->hasRole('Admin')) {
            abort(403);
        }

        $child->forceDelete();

        return redirect()->route('children.archived')->with('success', 'Child permanently deleted!');
    }

    /**
     * Store a new note for a child.
     */
    public function storeNote(Request $request, Child $child)
    {
        $user = auth()->user();

        // Healthworker can only add notes to children in their barangay, Admin has full access
        if ($child->barangay !== $user->barangay && ! $user->hasRole('Admin')) {
            abort(403);
        }

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

        $created = 0;
        $skipped = 0;

        foreach ($rows as $row) {
            // Skip invalid rows
            if (empty($row['first_name']) || empty($row['last_name']) || empty($row['sex'])) {
                continue;
            }

            // Check for duplicates within same barangay
            $existingChild = Child::where('barangay', $user->barangay)
                ->where('first_name', $row['first_name'])
                ->where('last_name', $row['last_name'])
                ->where('birthdate', $row['birthdate'])
                ->first();

            if ($existingChild) {
                $skipped++;

                continue;
            }

            $sex = strtoupper($row['sex']) === 'M' ? 'Male' : 'Female';

            Child::create([
                'first_name' => $row['first_name'],
                'middle_initial' => $row['middle_initial'] ?? null,
                'last_name' => $row['last_name'],
                'sex' => $sex,
                'weight' => $row['weight'] ?? 0,
                'height' => $row['height'] ?? 0,
                'birthdate' => $row['birthdate'] ?? null,
                'barangay' => $user->barangay,
                'created_by' => $user->id,
                'address' => null,
                'contact_number' => null,
            ]);

            $created++;
        }

        $message = "Import complete! {$created} children imported.";
        if ($skipped > 0) {
            $message .= " {$skipped} duplicates skipped.";
        }

        return redirect('/children')->with('success', $message);
    }
}
