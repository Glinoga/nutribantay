<?php

namespace App\Http\Controllers;

use App\Models\Vaccine;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VaccineController extends Controller
{
    public function index()
    {
        $vaccines = Vaccine::withCount('childVaccines')
            ->with('creator:id,name')
            ->orderBy('name')
            ->get();

        return Inertia::render('Vaccines/Index', [
            'vaccines' => $vaccines->map(fn ($v) => [
                'id' => $v->id,
                'name' => $v->name,
                'description' => $v->description,
                'children_count' => $v->child_vaccines_count,
                'created_by' => $v->creator?->name,
                'created_at' => $v->created_at->format('Y-m-d H:i:s'),
            ]),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:vaccines,name',
            'description' => 'nullable|string|max:1000',
        ]);

        Vaccine::create([
            'name' => $request->name,
            'description' => $request->description,
            'created_by' => auth()->id(),
        ]);

        return redirect()->route('vaccines.index')->with('success', 'Vaccine added successfully!');
    }

    public function update(Request $request, Vaccine $vaccine)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:vaccines,name,'.$vaccine->id,
            'description' => 'nullable|string|max:1000',
        ]);

        $vaccine->update([
            'name' => $request->name,
            'description' => $request->description,
        ]);

        return redirect()->route('vaccines.index')->with('success', 'Vaccine updated successfully!');
    }

    public function destroy(Vaccine $vaccine)
    {
        $vaccine->delete();

        return redirect()->route('vaccines.index')->with('success', 'Vaccine deleted successfully!');
    }
}
