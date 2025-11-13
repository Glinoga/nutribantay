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

        $children = Child::with('creator')
            ->where('barangay', $user->barangay)
            ->get();

        return Inertia::render('Children/Index', [
            'children' => $children->map(fn($child) => [
                'id' => $child->id,
                'uid' => $child->uid,
                'name' => $child->name,
                'sex' => $child->sex,
                'age' => $child->age,
                'weight' => $child->weight,
                'height' => $child->height,
                'created_by' => $child->creator?->name,
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
        $request->validate([
            'name' => 'required|string|max:255',
            'sex' => 'required|in:Male,Female',
            'age' => 'required|integer|min:0',
            'weight' => 'nullable|numeric|min:0|max:200',
            'height' => 'nullable|numeric|min:0|max:250',
            'contact_number' => 'nullable|string|max:50',
        ]);

        $user = auth()->user();

        // Format phone number: remove spaces and ensure it's stored consistently
        $contactNumber = $request->contact_number;
        if ($contactNumber) {
            // Keep the formatted version with spaces as user entered it
            $contactNumber = trim($contactNumber);
        }

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

        return redirect()->route('children.index')->with('success', 'Child added successfully!');
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
