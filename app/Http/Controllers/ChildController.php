<?php

namespace App\Http\Controllers;

use App\Models\Child;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ChildController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();

        $query = Child::with(['creator', 'updater'])
            ->where('barangay', $user->barangay);

        // Search filter
        if ($request->search) {
            $search = $request->search;

            // If search is a number, filter by age >= that number
            if (is_numeric($search)) {
                $minBirthdate = now()->subMonths($search)->toDateString();
                $query->where('birthdate', '<=', $minBirthdate);
            } else {
                // Otherwise search by name/sex only
                $query->where(function ($q) use ($search) {
                    $searchLower = strtolower($search);
                    $q->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhereRaw('LOWER(sex) = ?', [$searchLower]);  // case-insensitive for sex
                });
            }
        }

        $children = $query->paginate(25, ['*'], 'page', $request->page ?? 1);

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
            ]),
            'pagination' => [
                'current_page' => $children->currentPage(),
                'last_page' => $children->lastPage(),
                'total' => $children->total(),
                'from' => $children->firstItem(),
                'to' => $children->lastItem(),
            ],
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
            'weight' => 'nullable|numeric|min:0|max:200',
            'height' => 'nullable|numeric|min:0|max:250',
            'birthdate' => 'nullable|date',
            'address' => 'nullable|string|max:255',
            'contact_number' => 'nullable|string|max:50',
            'contact_number' => 'nullable|string|max:50',
        ]);

        $user = auth()->user();

        // Format phone number: remove spaces and ensure it's stored consistently
        $contactNumber = $request->contact_number;
        if ($contactNumber) {
            // Keep the formatted version with spaces as user entered it
            $contactNumber = trim($contactNumber);
        }

        // ✅ Normalize sex
        $validated['sex'] = strtoupper($validated['sex']) === 'M' ? 'Male' : 'Female';

        Child::create([
            'name'           => $request->name,
            'sex'            => $request->sex,
            'age'            => $request->age,
            'weight'         => $request->weight,
            'height'         => $request->height,
            'contact_number' => $contactNumber,
            'created_by'     => $user->id,
            'barangay'       => $user->barangay,
        ]);

        return redirect()->back()->with('success', 'Note added successfully!');
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

    public function edit($id)
    {
        $child = Child::findOrFail($id);

        return Inertia::render('Children/Edit', [
            'child' => [
                'id' => $child->id,
                'name' => $child->name,
                'sex' => $child->sex,
                'age' => $child->age,
                'weight' => $child->weight,
                'height' => $child->height,
            ]
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'sex' => 'required|in:Male,Female',
            'age' => 'required|integer|min:0',
            'weight' => 'nullable|numeric|min:0|max:200',
            'height' => 'nullable|numeric|min:0|max:250',
        ]);

        $child = Child::findOrFail($id);
        $child->update($request->only(['name', 'sex', 'age', 'weight', 'height']));

        return redirect()->route('children.index')->with('success', 'Child updated successfully!');
    }

    public function destroy($id)
    {
        $child = Child::findOrFail($id);
        $child->delete();

        return redirect()->route('children.index')->with('success', 'Child deleted successfully!');
    }
}
