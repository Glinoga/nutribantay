<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Models\AnnouncementImage;
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

        $query = Announcement::with('category', 'images');

        if ($filter === 'active') {
            $query->whereDate('date', '<=', now()->toDateString())
                ->where(function ($q) {
                    $q->whereNull('end_date')
                        ->orWhereDate('end_date', '>=', now()->toDateString());
                });
        } elseif ($filter === 'upcoming') {
            $query->whereDate('date', '>', now()->toDateString());
        } elseif ($filter === 'expired') {
            $query->whereDate('end_date', '<', now()->toDateString());
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $words = explode(' ', $search);
                foreach ($words as $word) {
                    $q->where(function ($wq) use ($word) {
                        $wq->where('title', 'like', "%{$word}%")
                            ->orWhere('summary', 'like', "%{$word}%")
                            ->orWhere('author', 'like', "%{$word}%");
                    });
                }
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
            'view' => $request->query('view', 'card'),
        ]);
    }

    public function guestIndex()
    {
        // Only show announcements where the publication date has arrived (today or in the past)
        // and if they have an end_date, make sure it hasn't passed yet
        $announcements = Announcement::with('category', 'images')
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
            'categories' => Category::all(),
        ]);
    }

    public function guestShow(Announcement $announcement)
    {
        // Check if announcement is published and still active
        if ($announcement->date > now()->toDateString() ||
            ($announcement->end_date && $announcement->end_date < now()->toDateString())) {
            abort(404);
        }

        $announcement->load('category', 'images');

        $relatedAnnouncements = Announcement::with('category', 'images')
            ->where('category_id', $announcement->category_id)
            ->where('id', '!=', $announcement->id)
            ->where('date', '<=', now())
            ->where(function ($q) {
                $q->whereNull('end_date')
                    ->orWhereDate('end_date', '>=', now()->toDateString());
            })
            ->orderBy('date', 'desc')
            ->take(3)
            ->get();

        return Inertia::render('Guest/showannouncement', [
            'announcement' => $announcement,
            'relatedAnnouncements' => $relatedAnnouncements,
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
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpg,jpeg,png,gif|max:5120',
        ]);

        $announcement = Announcement::create($validated);

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $image) {
                $path = $image->store('announcements', 'public');
                $announcement->images()->create([
                    'image_path' => $path,
                    'sort_order' => $index,
                ]);
            }
        }

        return redirect()->route('announcements.index')->with('success', 'Announcement created successfully.');
    }

    public function edit(Request $request, Announcement $announcement)
    {
        $announcement->load('images');

        return Inertia::render('Announcements/Edit', [
            'announcement' => $announcement,
            'categories' => Category::all(),
            'page' => $request->query('page', 1),
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
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpg,jpeg,png,gif|max:5120',
        ]);

        unset($validated['images']);

        $announcement->update($validated);

        if ($request->hasFile('images')) {
            $maxOrder = $announcement->images()->max('sort_order') ?? 0;
            foreach ($request->file('images') as $index => $image) {
                $path = $image->store('announcements', 'public');
                $announcement->images()->create([
                    'image_path' => $path,
                    'sort_order' => $maxOrder + $index + 1,
                ]);
            }
        }

        $page = $request->input('page', 1);

        return redirect()->route('announcements.index', ['page' => $page])->with('success', 'Announcement updated successfully.');
    }

    // Archive old announcements (implemented) && If user wants to archive (not implemented yet)
    // public function archive(Announcement $announcement)
    // {
    //     if ($announcement->end_date && Carbon::parse($announcement->end_date)->lt(now())) {
    //         $announcement->delete();
    //     }

    //     return redirect()->route('announcements.index')->with('success', 'Announcement archived successfully.');
    // }

    public function reorderImages(Request $request, Announcement $announcement)
    {
        $request->validate([
            'images' => 'required|array',
            'images.*.id' => 'required|exists:announcement_images,id',
            'images.*.sort_order' => 'required|integer|min:0',
        ]);

        foreach ($request->images as $item) {
            AnnouncementImage::where('id', $item['id'])
                ->where('announcement_id', $announcement->id)
                ->update(['sort_order' => $item['sort_order']]);
        }

        return redirect()->back()->with('success', 'Images reordered successfully.');
    }

    public function destroyImage(Announcement $announcement, AnnouncementImage $image)
    {
        Storage::disk('public')->delete($image->image_path);
        $image->delete();

        return redirect()->back()->with('success', 'Image deleted successfully.');
    }

    public function destroy(Announcement $announcement)
    {
        $announcement->delete();

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

        $announcement->forceDelete();

        return redirect()->route('announcements.archived')->with('success', 'Announcement permanently deleted.');
    }
}
