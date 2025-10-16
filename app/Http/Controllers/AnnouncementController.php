<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class AnnouncementController extends Controller
{
    public function index()
    {
        $announcements = Announcement::with('category')->latest()->get();

        return Inertia::render('Announcements/Index', [
            'announcements' => $announcements,
        ]);
    }

    public function guestIndex() 
    {
        $announcements = Announcement::with('category')->whereDate('end_date', '>=', now())->latest()->get();

        return Inertia::render('guest/announcements', [
            'announcements' => $announcements,
        ]);
    }

    public function show(Announcement $announcement)
    {
        return Inertia::render('Announcements/Show', [
            'announcement' => $announcement,
        ]);
    }

    public function create()
    {
        return Inertia::render('Announcements/Create', [
            'categories' => Category::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'date' => 'required|date|after_or_equal:' . now()->format('Y-m-d'),
            'author' => 'nullable|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'end_date' => 'nullable|date|after_or_equal:date',
            'summary' => 'required|string',
            'content' => 'required|string',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,gif|max:2048',
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('announcements', 'public');
        }

        Announcement::create($validated);

        return redirect()->route('announcements.index')->with('success', 'Announcement created successfully.');
    }

    public function edit(Announcement $announcement)
    {
        return Inertia::render('Announcements/Edit', [
            'announcement' => $announcement,
            'categories' => Category::all(),
        ]);
    }

    public function update(Request $request, Announcement $announcement)
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'date' => 'sometimes|date',
            'end_date' => 'nullable|date|after_or_equal:date',
            'author' => 'nullable|string|max:255',
            'category_id' => 'sometimes|exists:categories,id',
            'summary' => 'sometimes|string',
            'content' => 'sometimes|string',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,gif|max:2048',
        ]);

        if ($request->hasFile('image')) {
            if ($announcement->image) {
                Storage::disk('public')->delete($announcement->image);
            }
            $validated['image'] = $request->file('image')->store('announcements', 'public');
        }

        $announcement->update($validated);

        return redirect()->route('announcements.index')->with('success', 'Announcement updated successfully.');
    }

    public function destroy(Announcement $announcement)
    {
        if ($announcement->image) {
            Storage::disk('public')->delete($announcement->image);
        }

        $announcement->delete();

        return redirect()->route('announcements.index')->with('success', 'Announcement deleted successfully.');
    }
}
