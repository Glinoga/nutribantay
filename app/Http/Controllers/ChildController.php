<?php

namespace App\Http\Controllers;

use App\Models\Child;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ChildController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        $children = Child::with(['creator', 'updater'])
            ->where('barangay', $user->barangay)
            ->get();

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
                'created_by' => $child->creator?->name,
                'updated_by' => $child->updater?->name,
                'updated_at' => $child->updated_at,
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
            'sex' => 'required|in:Male,Female',
            'age' => 'required|integer|min:0',
            'weight' => 'nullable|numeric|min:0|max:200',
            'height' => 'nullable|numeric|min:0|max:250',
            'birthdate' => 'nullable|date',
            'address' => 'nullable|string|max:255',
            'contact_number' => 'nullable|string|max:50',
        ]);

        $user = auth()->user();

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
                'created_by' => $child->creator?->name,
                'updated_by' => $child->updater?->name,
                'updated_at' => $child->updated_at,
                'created_at' => $child->created_at,
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
                'updated_by' => $child->updater?->name,
                'updated_at' => $child->updated_at,
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
            'sex' => 'required|in:Male,Female',
            'age' => 'required|integer|min:0',
            'weight' => 'nullable|numeric|min:0|max:200',
            'height' => 'nullable|numeric|min:0|max:250',
            'birthdate' => 'nullable|date',
            'address' => 'nullable|string|max:255',
            'contact_number' => 'nullable|string|max:50',
        ]);

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

        $child->delete();

        return redirect()->route('children.index')
            ->with('success', 'Child deleted successfully!');
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
