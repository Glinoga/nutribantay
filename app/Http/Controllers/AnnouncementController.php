<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AnnouncementController extends Controller
{
    // Public: anyone can read
    public function index()
    {
       $announcements = Announcement::latest()->get();
    return Inertia::render('Announcements/AdminAnnouncements', [
        'announcements' => $announcements,
    ]);
    }

    public function show($id)
    {
        return response()->json(Announcement::findOrFail($id));
    }

    // Protected: only admin/healthworker can create/update/delete
    public function store(Request $request)
    {
        $request->validate([
        'title' => 'required|string|max:255',
        'content' => 'required|string',
    ]);

    Announcement::create([
        'title' => $request->title,
        'content' => $request->content,
        'user_id' => auth()->id(),
    ]);

    $announcements = Announcement::latest()->get();

    return inertia('Announcements/AdminAnnouncements', [
        'announcements' => $announcements,
    ])->with('success', 'Announcement added!');
    }

    public function update(Request $request, $id)
    {
        $announcement = Announcement::findOrFail($id);

    if (!auth()->user()->hasRole(['Admin', 'Healthworker'])) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    $announcement->update($request->only(['title', 'content']));

    return response()->json($announcement);
    }

    public function destroy($id)
    {
        $announcement = Announcement::findOrFail($id);

    if (!auth()->user()->hasRole(['Admin', 'Healthworker'])) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    $announcement->delete();

    return response()->json(['message' => 'Deleted successfully']);
    }
}

