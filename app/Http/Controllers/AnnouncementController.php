<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Models\Category;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AnnouncementController extends Controller
{
    public function index(Request $request)
    {
        $filter = $request->query('filter', 'active');
        $search = $request->query('search');

        $query = Announcement::with('category');

        if ($filter === 'active') {
            $query->where(function ($q) {
                $q->whereNull('end_date')
                    ->orWhereDate('end_date', '>=', now()->toDateString());
            });
        } elseif ($filter === 'expired') {
            $query->whereDate('end_date', '<', now()->toDateString());
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('summary', 'like', "%{$search}%")
                    ->orWhere('author', 'like', "%{$search}%");
            });
        }

        $query->orderByRaw(
            'CASE WHEN end_date IS NULL OR end_date >= ? THEN 0 ELSE 1 END',
            [now()->toDateString()]
        )->orderBy('date', 'desc');

        $announcements = $query->paginate(9);

        return Inertia::render('Announcements/Index', [
            'announcements' => $announcements->items(),
            'pagination' => [
                'current_page' => $announcements->currentPage(),
                'last_page' => $announcements->lastPage(),
                'per_page' => $announcements->perPage(),
                'total' => $announcements->total(),
                'from' => $announcements->firstItem(),
                'to' => $announcements->lastItem(),
            ],
            'categories' => Category::all(),
            'filter' => $filter,
            'search' => $search,
        ]);
    }

    public function guestIndex()
    {
        // Only show announcements where the publication date has arrived (today or in the past)
        // and if they have an end_date, make sure it hasn't passed yet
        $announcements = Announcement::with('category')
            ->whereDate('date', '<=', now())
            ->where(function ($query) {
                $query->whereNull('end_date')
                    ->orWhereDate('end_date', '>=', now());
            })
            ->latest('date')
            ->paginate(9);

        return Inertia::render('Guest/announcements', [
            'announcements' => $announcements->items(),
            'pagination' => [
                'current_page' => $announcements->currentPage(),
                'last_page' => $announcements->lastPage(),
                'per_page' => $announcements->perPage(),
                'total' => $announcements->total(),
                'from' => $announcements->firstItem(),
                'to' => $announcements->lastItem(),
            ],
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

        return Inertia::render('Guest/showannouncement', [
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

    public function archived()
    {
        $archivedAnnouncements = Announcement::onlyTrashed()
            ->with('category')
            ->get()
            ->map(fn ($announcement) => [
                'id' => $announcement->id,
                'title' => $announcement->title,
                'category_id' => $announcement->category_id,
                'category' => $announcement->category,
                'date' => $announcement->date,
                'end_date' => $announcement->end_date,
                'author' => $announcement->author,
                'summary' => $announcement->summary,
                'deleted_at' => $announcement->deleted_at,
            ]);

        return Inertia::render('Announcements/Archived', [
            'announcements' => $archivedAnnouncements,
        ]);
    }

    public function restore($id)
    {
        $announcement = Announcement::onlyTrashed()->findOrFail($id);
        $announcement->restore();

        return redirect()->route('announcements.archived')->with('success', 'Announcement restored successfully!');
    }

    public function forceDelete($id)
    {
        $announcement = Announcement::onlyTrashed()->findOrFail($id);

        if ($announcement->image) {
            Storage::disk('public')->delete($announcement->image);
        }

        $announcement->forceDelete();

        return redirect()->route('announcements.archived')->with('success', 'Announcement permanently deleted.');
    }
}
