<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Models\Category;
use Carbon\Carbon;
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
            'categories' => Category::all(),
        ]);
    }

    public function guestIndex()
    {
        // Only show announcements where the publication date has arrived (today or in the past)
        // and if they have an end_date, make sure it hasn't passed yet
        $announcements = Announcement::with('category')
            ->whereDate('date', '<=', now()) // Publication date has arrived
            ->where(function ($query) {
                $query->whereNull('end_date') // No end date (permanent announcements)
                    ->orWhereDate('end_date', '>=', now()); // Or end date hasn't passed
            })
            ->latest()
            ->get();

        return Inertia::render('guest/announcements', [
            'announcements' => $announcements,
        ]);
    }

    public function guestShow(Announcement $announcement)
    {
        // Check if announcement is published and still active
        if ($announcement->date > now()->toDateString() || 
            ($announcement->end_date && $announcement->end_date < now()->toDateString())) {
            abort(404);
        }

        $announcement->load('category');

        return Inertia::render('guest/showannouncement', [
            'announcement' => $announcement,
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
            'date' => 'required|date|after_or_equal:today',
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

    // Archive old announcements (implemented) && If user wants to archive (not implemented yet)
    // public function archive(Announcement $announcement)
    // {
    //     if ($announcement->end_date && Carbon::parse($announcement->end_date)->lt(now())) {
    //         $announcement->delete();
    //     }

    //     return redirect()->route('announcements.index')->with('success', 'Announcement archived successfully.');
    // }


    public function destroy(Announcement $announcement)
    {
        if ($announcement->image) {
            Storage::disk('public')->delete($announcement->image);
        }

        $announcement->delete();

        // for forceDeletion
        // $announcement->forceDelete();

        return redirect()->route('announcements.index')->with('success', 'Announcement deleted successfully.');
    }
}
