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

        return Inertia::render('Announcements/GuestAnnouncements', [
            'announcements' => $announcements,
        ]);
    }

    public function show($id)
    {
        $announcement = Announcement::findOrFail($id);

        return Inertia::render('Announcements/ShowAnnouncement', [
            'announcement' => $announcement,
        ]);
    }

    public function adminIndex()
    {
        $announcements = Announcement::latest()->get();

        return Inertia::render('Announcements/AdminAnnouncements', [
            'announcements' => $announcements,
        ]);
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
        'user_id' => Auth::id(),
    ]);

    $announcements = Announcement::latest()->get();

    return Inertia::render('Announcements/AdminAnnouncements', [
        'announcements' => $announcements,
    ]);
}



    public function update(Request $request, $id)
    {
        $announcement = Announcement::findOrFail($id);

        if (!auth()->user()->hasRole(['Admin', 'Healthworker'])) {
            abort(403);
        }

        $request->validate([
            'title'   => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        $announcement->update($request->only(['title', 'content']));

        return $this->adminIndex()->with('success', 'Announcement updated!');
    }

    public function destroy($id)
    {
        $announcement = Announcement::findOrFail($id);

        if (!auth()->user()->hasRole(['Admin', 'Healthworker'])) {
            abort(403);
        }

        $announcement->delete();

        return $this->adminIndex()->with('success', 'Announcement deleted!');
    }
}

