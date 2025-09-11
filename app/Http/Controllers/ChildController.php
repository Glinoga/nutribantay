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
            ->where('barangay', $user->barangay) // only children in user's barangay
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
                'created_by' => $child->creator?->name, // correctly get creator's name
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
        ]);

        $user = auth()->user();

        Child::create([
            'name'       => $request->name,
            'sex'        => $request->sex,
            'age'        => $request->age,
            'weight'     => $request->weight,
            'height'     => $request->height,
            'created_by' => $user->id, // or $user->id if your DB expects integer
            'barangay'   => $user->barangay, // inherit from creator
        ]);

        return redirect()->route('children.index')->with('success', 'Child added successfully!');
    }
}
    