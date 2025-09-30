<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;


class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
{
    $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
        'password' => ['required', 'confirmed', Rules\Password::defaults()],
        'barangay' => ['required', 'string', 'max:255'],
        'registration_code' => ['required', 'string'],
    ]);

    // fetch the code (must exist, not expired, and not used yet)
    $registrationCode = \App\Models\RegistrationCode::where('code', $request->registration_code)
        ->where(function ($q) {
            $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
        })
        ->where('is_used', false)
        ->first();

    if (! $registrationCode) {
        return back()->withErrors([
            'registration_code' => 'The admin code is invalid, expired, or already used.',
        ])->onlyInput('registration_code');
    }

    // create user
    $user = User::create([
        'name' => $request->name,
        'email' => $request->email,
        'password' => Hash::make($request->password),
        'barangay' => $request->barangay,
    ]);

    // assign default role
    $user->assignRole('Healthworker');

    // consume the code → mark as used + delete it
    $registrationCode->update(['is_used' => true]);
    $registrationCode->delete();

    event(new Registered($user));
    Auth::login($user);

    return redirect()->intended(route('dashboard', absolute: false));
}


}
