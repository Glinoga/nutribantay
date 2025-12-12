<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Setting;
use Illuminate\Support\Facades\Auth;

class CheckMaintenanceMode
{
    public function handle(Request $request, Closure $next)
    {
        $maintenance = Setting::get('maintenance_mode', '0') === '1';

        // Whitelisted routes that can always be accessed (including home/landing)
        $whitelist = [
            '/',
            'home',
            'login',
            'logout',
            'forgot-password',
            'reset-password/*',
            'announcements',
            'contact',
        ];

        // Check if current route matches whitelist
        foreach ($whitelist as $path) {
            if ($request->is($path)) {
                return $next($request);
            }
        }

        // If maintenance mode is enabled
        if ($maintenance) {
            $user = Auth::user();
            
            // If user is logged in
            if ($user) {
                // Check if user has Admin role
                $isAdmin = $user->hasRole('Admin');
                
                // If not admin, force logout and redirect to home
                if (!$isAdmin) {
                    Auth::logout();
                    $request->session()->invalidate();
                    $request->session()->regenerateToken();
                    
                    // Redirect to home with a message
                    return redirect('/')->with('maintenance', 'The system is currently in maintenance mode. You have been logged out.');
                }
                
                // Admin can proceed
                return $next($request);
            }
            
            // Not logged in - show maintenance page
            return response()->view('maintenance', [], 503);
        }

        return $next($request);
    }
}