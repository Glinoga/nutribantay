<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AnnouncementController extends Controller
{
    public function index()
    {
       return Inertia::render('Announcements/Index', []);
    }

    public function create() {
        return Inertia::render('Announcements/Create');
    }

    public function store(Request $request) {
        $request->validate([
            'title' => 'required|string|max:255',
            'date' => [
                'required',
                Rule::date()->afterOrEqual(now()->format('M-d-Y')),
            ],
            'end_date' => 'nullable|date|after_or_equal:date',
            'summary' => 'required|string',
            'content' => 'required|string',
        ]);

        

        Announcement::create($request->all());
        return redirect()->route('announcements.index')->with('success', 'Announcement created successfully.');
    }
}
