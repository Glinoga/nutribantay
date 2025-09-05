<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\RegistrationCode;
use Illuminate\Support\Str;

class RegistrationCodeController extends Controller
{
    public function generate()
    {
        // generate secure random code
        $code = strtoupper(Str::random(8));

        // save to database with 1 day expiry
        $registrationCode = RegistrationCode::create([
            'code' => $code,
            'expires_at' => now()->addDay(),
        ]);

        return response()->json(['code' => $code]);
    }
}
