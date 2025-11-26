<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Setting;

class CheckMaintenanceMode
{
    public function handle(Request $request, Closure $next)
    {
        $maintenance = Setting::get('maintenance_mode', '0') === '1';

        // Whitelisted routes that can always be accessed
        $whitelist = [
            '/',
            'home',
            'login',
            'logout',
            'forgot-password',
            'reset-password/*',
        ];

        foreach ($whitelist as $path) {
            if ($request->is($path)) {
                return $next($request);
            }
        }

        // If maintenance mode is enabled and user is not admin
        if ($maintenance && (!auth()->check() || !auth()->user()->hasRole('Admin'))) {
            // Force logout if logged in
            if (auth()->check()) {
                auth()->logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();
            }

            // Stop further access
            return response()->view('maintenance', [], 503);
        }

        return $next($request);
    }
}

