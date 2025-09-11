<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\RegistrationCode;
use Illuminate\Support\Str;

class RegistrationCodeController extends Controller
{
    public function generate()
    {
        // Generate secure random code
        $code = strtoupper(Str::random(8));

        // Save to database with 1-day expiry
        $registrationCode = RegistrationCode::create([
            'code'       => $code,
            'expires_at' => now()->addDay(),
        ]);

        // Keep only the 5 most recent codes
        $excess = RegistrationCode::count() - 5;
        if ($excess > 0) {
            RegistrationCode::orderBy('created_at', 'asc')
                ->take($excess)
                ->delete();
        }

        return response()->json([
            'code' => $code,
        ]);
    }

    public function latest()
    {
        $registrationCode = RegistrationCode::latest()->first();

        return response()->json([
            'code'       => $registrationCode?->code,
            'expires_at' => $registrationCode?->expires_at,
        ]);
    }
}
