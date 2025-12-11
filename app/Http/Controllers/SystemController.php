<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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

    // NEW: Log out all healthworkers when enabling maintenance
    if ($value === '1') {
        $this->logoutHealthworkers();
    }

    return response()->json(['status' => $value === '1']);
}

// NEW METHOD: Force logout healthworkers
private function logoutHealthworkers()
{
    // Get all healthworker users
    $healthworkers = \App\Models\User::whereHas('roles', function($query) {
        $query->where('name', 'Healthworker');
    })->get();

    // Delete their sessions from database
    \DB::table('sessions')
        ->whereIn('user_id', $healthworkers->pluck('id'))
        ->delete();
}
}