<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;

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

        return response()->json(['status' => $value === '1']);
    }
}
