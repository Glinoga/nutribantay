<?php

namespace App\Http\Controllers;

use App\Models\Vitamin;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VitaminController extends Controller
{
    public function index()
    {
        $vitamins = Vitamin::withCount(['childVitamins' => function ($query) {
            $query->whereHas('child', fn ($q) => $q->where('birthdate', '>=', now()->subMonths(60)));
        }])
            ->with('creator.roles')
            ->orderBy('name')
            ->get();

        $mostPopular = $vitamins->sortByDesc('child_vitamins_count')->first();

        $stats = [
            'total' => $vitamins->count(),
            'total_children' => $vitamins->sum('child_vitamins_count'),
            'most_popular' => $mostPopular?->name,
            'most_popular_count' => $mostPopular?->child_vitamins_count ?? 0,
            'recently_added' => $vitamins->where('created_at', '>=', now()->subDays(30))->count(),
        ];

        return Inertia::render('Vitamins/Index', [
            'vitamins' => $vitamins->map(fn ($v) => [
                'id' => $v->id,
                'name' => $v->name,
                'description' => $v->description,
                'children_count' => $v->child_vitamins_count,
                'created_by' => $v->creator?->display_name,
                'created_at' => $v->created_at ? $v->created_at->format('Y-m-d H:i:s') : null,
            ]),
            'stats' => $stats,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:vitamins,name',
            'description' => 'nullable|string|max:1000',
        ]);

        Vitamin::create([
            'name' => $request->name,
            'description' => $request->description,
            'created_by' => auth()->id(),
        ]);

        return redirect()->route('vitamins.index')->with('success', 'Vitamin added successfully!');
    }

    public function update(Request $request, Vitamin $vitamin)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:vitamins,name,'.$vitamin->id,
            'description' => 'nullable|string|max:1000',
        ]);

        $vitamin->update([
            'name' => $request->name,
            'description' => $request->description,
        ]);

        return redirect()->route('vitamins.index')->with('success', 'Vitamin updated successfully!');
    }

    public function destroy(Vitamin $vitamin)
    {
        $vitamin->delete();

        return redirect()->route('vitamins.index')->with('success', 'Vitamin deleted successfully!');
    }
}
