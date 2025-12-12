<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;

class SystemController extends Controller
{
    // Get maintenance status
    public function status()
    {
        $status = Setting::get('maintenance_mode', '0') === '1';
        return response()->json(['status' => $status]);
    }

    // Toggle maintenance mode
    public function toggle(Request $request)
    {
        $value = $request->input('status') ? '1' : '0';
        Setting::set('maintenance_mode', $value);

        // If enabling maintenance mode, store a flag in the session
        // This will trigger logout on the next request for non-admins
        if ($value === '1') {
            Session::put('maintenance_mode_enabled', true);
        }

        return response()->json([
            'status' => $value === '1',
            'message' => $value === '1' 
                ? 'Maintenance mode enabled. Non-admin users will be logged out on their next request.' 
                : 'Maintenance mode disabled.'
        ]);
    }
}