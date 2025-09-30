<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\RegistrationCode;
use Illuminate\Support\Str;

class RegistrationCodeController extends Controller
{
    public function generate(Request $request)
{
    $count = $request->input('count', 1); // default to 1 if not provided
    $codes = [];

    for ($i = 0; $i < $count; $i++) {
        $code = strtoupper(Str::random(8));

        $registrationCode = RegistrationCode::create([
            'code'       => $code,
            'expires_at' => now()->addDay(),
        ]);

        $codes[] = [
            'code'       => $registrationCode->code,
            'expires_at' => $registrationCode->expires_at,
        ];
    }

    return response()->json([
        'codes' => $codes,
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
