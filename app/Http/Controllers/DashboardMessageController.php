<?php

namespace App\Http\Controllers;

use App\Models\DashboardMessage;
use Illuminate\Http\Request;

class DashboardMessageController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'message' => ['required', 'string', 'max:500'],
        ]);

        DashboardMessage::create([
            'message' => $request->message,
        ]);

        return redirect()->route('dashboard');
    }

    public function destroy(DashboardMessage $dashboardMessage)
    {
        $dashboardMessage->delete();

        return redirect()->route('dashboard');
    }
}