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
            $query->where(function($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('sex', 'like', "%{$search}%")
                  ->orWhere('barangay', 'like', "%{$search}%");
            });
        }

        $children = $query->paginate(25, ['*'], 'page', $request->page ?? 1);

        return Inertia::render('Children/Index', [
            'children' => $children->map(fn($child) => [
                'id' => $child->id,
                'fullname' => $child->fullname,
                'first_name' => $child->first_name,
                'middle_initial' => $child->middle_initial,
                'last_name' => $child->last_name,
                'sex' => $child->sex,
                'age' => $child->age,
                'weight' => $child->weight,
                'height' => $child->height,
                'birthdate' => $child->birthdate,
                'address' => $child->address,
                'contact_number' => $child->contact_number,
                'barangay' => $child->barangay,

                'creator' => [
                    'name' => $child->creator?->name
                ],
            ]),
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
            'children' => $archivedChildren->map(fn($child) => [
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
            'age' => 'required|integer|min:0',
            'weight' => 'nullable|numeric|min:0|max:200',
            'height' => 'nullable|numeric|min:0|max:250',
            'birthdate' => 'nullable|date',
            'address' => 'nullable|string|max:255',
            'contact_number' => 'nullable|string|max:50',
        ]);

        $user = auth()->user();

        // ✅ Normalize sex
        $validated['sex'] = strtoupper($validated['sex']) === 'M' ? 'Male' : 'Female';

        Child::create([
            ...$validated,
            'created_by' => $user->id,
            'barangay' => $user->barangay,
        ]);

        return redirect()->route('children.index')
            ->with('success', 'Child added successfully!');
    }

    public function show(Child $child)
    {
        $user = auth()->user();
        $child->load(['notes.author']);

        if ($child->barangay !== $user->barangay) {
            abort(403);
        }

        return Inertia::render('Children/Show', [
            'child' => [
                'id' => $child->id,
                'fullname' => $child->fullname,
                'first_name' => $child->first_name,
                'middle_initial' => $child->middle_initial,
                'last_name' => $child->last_name,
                'sex' => $child->sex,
                'age' => $child->age,
                'weight' => $child->weight,
                'height' => $child->height,
                'birthdate' => $child->birthdate,
                'address' => $child->address,
                'contact_number' => $child->contact_number,
                'barangay' => $child->barangay,

                'creator' => [
                    'name' => $child->creator?->name
                ],

                'notes' => $child->notes->map(fn($note) => [
                    'id' => $note->id,
                    'note' => $note->note,
                    'author' => ['name' => $note->author?->name],
                    'created_at' => $note->created_at,
                ]),
            ],
        ]);
    }

    public function edit(Child $child)
    {
        $user = auth()->user();

        if ($child->barangay !== $user->barangay) {
            abort(403);
        }

        return Inertia::render('Children/Edit', [
            'child' => [
                'id' => $child->id,
                'first_name' => $child->first_name,
                'middle_initial' => $child->middle_initial,
                'last_name' => $child->last_name,
                'sex' => $child->sex,
                'age' => $child->age,
                'weight' => $child->weight,
                'height' => $child->height,
                'birthdate' => $child->birthdate,
                'address' => $child->address,
                'contact_number' => $child->contact_number,
                'barangay' => $child->barangay,
            ],
        ]);
    }

    public function update(Request $request, Child $child)
    {
        $user = auth()->user();

        if ($child->barangay !== $user->barangay) {
            abort(403);
        }

        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'middle_initial' => 'nullable|string|max:5',
            'last_name' => 'required|string|max:255',
            'sex' => 'required|in:M,F,Male,Female',
            'age' => 'required|integer|min:0',
            'weight' => 'nullable|numeric|min:0|max:200',
            'height' => 'nullable|numeric|min:0|max:250',
            'birthdate' => 'nullable|date',
            'address' => 'nullable|string|max:255',
            'contact_number' => 'nullable|string|max:50',
        ]);

        // ✅ Normalize sex
        $validated['sex'] = strtoupper($validated['sex']) === 'M' ? 'Male' : 'Female';

        $child->update([
            ...$validated,
            'updated_by' => $user->id,
        ]);

        return redirect()->route('children.index')
            ->with('success', 'Child updated successfully!');
    }

    public function destroy(Child $child)
    {
        $user = auth()->user();

        if ($child->barangay !== $user->barangay) {
            abort(403);
        }

        // Soft delete - will trigger audit log
        $child->delete();

        return redirect()->route('children.index')
            ->with('success', 'Child archived successfully!');
    }

    public function restore(string $id)
    {
        $user = auth()->user();

        $child = Child::onlyTrashed()->findOrFail($id);

        if ($child->barangay !== $user->barangay) {
            abort(403);
        }

        // Restore - will trigger audit log
        $child->restore();

        return redirect()->route('children.index')
            ->with('success', 'Child restored successfully!');
    }

    public function forceDelete(string $id)
    {
        $user = auth()->user();

        $child = Child::onlyTrashed()->findOrFail($id);

        if ($child->barangay !== $user->barangay) {
            abort(403);
        }

        // Permanently delete - will trigger audit log
        $child->forceDelete();

        return redirect()->route('children.archived')
            ->with('success', 'Child permanently deleted!');
    }

    // 🔥 ✅ IMPORT FUNCTION (NEW)
    public function import(Request $request)
    {
        $user = auth()->user();

        $rows = $request->input('data');

        if (!$rows || !is_array($rows)) {
            return back()->with('error', 'Invalid import data.');
        }

        $created = 0;
        $skipped = 0;

        foreach ($rows as $row) {

            // skip invalid rows
            if (
                empty($row['first_name']) ||
                empty($row['last_name']) ||
                empty($row['sex'])
            ) {
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
                'age' => $row['age'] ?? 0,
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

        // Use regular redirect instead of Inertia to preserve flash message
        return redirect('/children')->with('success', $message);
    }

    public function storeNote(Request $request, Child $child)
    {
        $user = auth()->user();

        if ($child->barangay !== $user->barangay) {
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

    public function destroyNote(Child $child, $noteId)
    {
        $note = $child->notes()->findOrFail($noteId);

        $user = auth()->user();

        if ($note->user_id !== $user->id && !$user->hasRole('Admin')) {
            abort(403);
        }

        $note->delete();

        return redirect()->back()->with('success', 'Note deleted successfully.');
    }
}