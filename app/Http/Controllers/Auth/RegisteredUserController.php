<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'registration_code' => ['required', 'string'],
        ]);

        $registrationCode = \App\Models\RegistrationCode::where('code', $request->registration_code)
            ->where(function ($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->where('is_used', false)
            ->first();

        if (! $registrationCode) {
            return back()->withErrors([
                'registration_code' => 'The registration code is invalid, expired, or already used.',
            ])->onlyInput('registration_code');
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'barangay' => $registrationCode->barangay,
            'status' => 'pending',
        ]);

        $user->assignRole('Healthworker');

        $registrationCode->update(['is_used' => true]);
        $registrationCode->delete();

        return redirect()->route('login')->with('message', 'Your account has been created and is pending approval from the admin.');
    }
}
