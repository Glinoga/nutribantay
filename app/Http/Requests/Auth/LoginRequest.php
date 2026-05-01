<?php

namespace App\Http\Requests\Auth;

use App\Models\RegistrationCode;
use App\Models\User;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'login' => ['required', 'string'],
            'password' => ['required', 'string'],
        ];
    }

    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        $login = $this->input('login');
        $password = $this->input('password');

        // Try registration code first
        $code = RegistrationCode::where('code', $login)->first();
        if ($code) {
            $user = User::where('registration_code_id', $code->id)->first();
            if ($user && Hash::check($password, $user->password)) {
                $this->loginUser($user);

                return;
            }
        }

        // Fallback: try email
        $user = User::where('email', $login)->first();
        if ($user && Hash::check($password, $user->password)) {
            $this->loginUser($user);

            return;
        }

        // Login failed
        RateLimiter::hit($this->throttleKey());
        throw ValidationException::withMessages([
            'login' => __('auth.failed'),
        ]);
    }

    private function loginUser($user): void
    {
        if ($user->status === 'pending') {
            Auth::logout();
            RateLimiter::hit($this->throttleKey());
            throw ValidationException::withMessages([
                'login' => __('Your account is pending approval. Please wait for the admin to approve your registration.'),
            ]);
        }

        if ($user->status === 'rejected') {
            Auth::logout();
            RateLimiter::hit($this->throttleKey());
            throw ValidationException::withMessages([
                'login' => __('Your registration has been rejected. Please contact the admin for more information.'),
            ]);
        }

        Auth::login($user, $this->boolean('remember'));
        RateLimiter::clear($this->throttleKey());
    }

    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'login' => __('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    public function throttleKey(): string
    {
        return $this->string('login')
            ->lower()
            ->append('|'.$this->ip())
            ->transliterate()
            ->value();
    }
}
