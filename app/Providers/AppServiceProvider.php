<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if (config('app.env') === 'production') {
            URL::forceScheme('https');
        }

        Password::defaults(function () {
            return Password::min(10)
                ->letters()
                ->numbers();
        });

        $this->configureRateLimiting();
    }

    protected function configureRateLimiting(): void
    {
        RateLimiter::for('register', function ($request) {
            return Limit::perMinute(5)->by($request->ip());
        });

        RateLimiter::for('password.email', function ($request) {
            return Limit::perMinute(5)->by($request->ip());
        });

        RateLimiter::for('recommendations', function ($request) {
            $user = $request->user();

            if (! $user) {
                return null;
            }

            if ($user->hasRole('Admin')) {
                return Limit::none();
            }

            return Limit::perMinute(10)->by('recommendations:'.$user->id);
        });
    }
}
