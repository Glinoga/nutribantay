<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Setting;
use Inertia\Inertia;

class CheckMaintenanceMode
{
    public function handle(Request $request, Closure $next)
    {
        $maintenance = Setting::get('maintenance_mode', '0') === '1';

        // Whitelisted routes (accessible even during maintenance)
        $whitelist = [
            '/',
            'home',
            'login',
            'logout',
            'forgot-password',
            'reset-password/*',
            'announcements',
            'contact',
            'maintenance/status', // Allow status checks
        ];

        foreach ($whitelist as $path) {
            if ($request->is($path)) {
                return $next($request);
            }
        }

        // If maintenance mode is enabled
        if ($maintenance) {
            // If user is authenticated
            if (auth()->check()) {
                $user = auth()->user();
                
                // Check if user is NOT an admin
                if (!$user->hasRole('Admin')) {
                    // Force logout
                    auth()->logout();
                    $request->session()->invalidate();
                    $request->session()->regenerateToken();
                    
                    // Clear any remember me tokens
                    $user->remember_token = null;
                    $user->save();

                    // Handle different request types
                    if ($request->expectsJson() || $request->isXmlHttpRequest()) {
                        return response()->json([
                            'message' => '⚠️ System is under maintenance. Your session has been logged out.',
                            'maintenance' => true,
                            'redirect' => '/'
                        ], 503);
                    }

                    // Handle Inertia requests
                    if ($request->header('X-Inertia')) {
                        return Inertia::location('/');
                    }

                    // Set a flash message for the maintenance page
                    session()->flash('maintenance_message', 'The system is currently under maintenance. Your session has been logged out for security purposes. Please try again later.');

                    return response()->view('maintenance', [], 503);
                }
                
                // Allow admins to continue
                return $next($request);
            }
            
            // Non-authenticated users
            if ($request->expectsJson() || $request->isXmlHttpRequest()) {
                return response()->json([
                    'message' => 'System is under maintenance. Please try again later.',
                    'maintenance' => true
                ], 503);
            }

            if ($request->header('X-Inertia')) {
                return Inertia::location('/');
            }
            
            return response()->view('maintenance', [], 503);
        }

        return $next($request);
    }
}
