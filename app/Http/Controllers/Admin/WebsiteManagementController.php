<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteContent;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WebsiteManagementController extends Controller
{
    public function index()
    {
        $contents = SiteContent::getAllGrouped();

        return Inertia::render('Admin/WebsiteManagement', [
            'contents' => $contents,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'contents' => 'required|array',
            'contents.*.key' => 'required|string|exists:site_contents,key',
            'contents.*.value' => 'nullable|string',
        ]);

        foreach ($validated['contents'] as $item) {
            SiteContent::where('key', $item['key'])->update([
                'value' => $item['value'] ?? '',
            ]);
        }

        return redirect()->back()->with('success', 'Website content updated successfully.');
    }
}
