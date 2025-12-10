<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\RegistrationCodeController;
use App\Http\Controllers\ChildController;
use App\Http\Controllers\HealthlogController;
use App\Http\Controllers\RecommendationController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\SystemController;
use App\Http\Controllers\HomeController;

/*
|--------------------------------------------------------------------------
| Public Pages
|--------------------------------------------------------------------------
*/
Route::get('/', fn () => Inertia::render('home'))->name('home');
Route::get('/announcements', fn () => Inertia::render('announcements'))->name('announcements');
Route::get('/contact', fn () => Inertia::render('contact'))->name('contact');

/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('/dashboard', fn () => Inertia::render('dashboard'))->name('dashboard');

    /*
    |--------------------------------------------------------------------------
    | CHILDREN
    |--------------------------------------------------------------------------
    */
    Route::resource('children', ChildController::class);
    Route::post('/children/{child}/notes', [ChildController::class, 'storeNote'])->name('children.notes.store');
    Route::delete('/children/{child}/notes/{note}', [ChildController::class, 'destroyNote'])->name('children.notes.destroy');

    /*
    |--------------------------------------------------------------------------
    | ADMIN ONLY
    |--------------------------------------------------------------------------
    */
    Route::middleware(['role:Admin'])->group(function () {
        Route::get('/users/archived', [UserController::class, 'archived'])->name('users.archived');
        Route::post('/users/{id}/restore', [UserController::class, 'restore'])->name('users.restore');
        Route::delete('/users/{id}/force-delete', [UserController::class, 'forceDelete'])->name('users.forceDelete');
        Route::post('/users/{id}/update-role', [UserController::class, 'updateRole'])->name('users.updateRole');

        Route::post('/registration-codes/generate', [RegistrationCodeController::class, 'generate']);
        Route::get('/registration-codes/latest', [RegistrationCodeController::class, 'latest']);
        Route::get('/maintenance/status', [SystemController::class, 'status']);
        Route::post('/maintenance/toggle', [SystemController::class, 'toggle']);
        Route::resource('users', UserController::class);
        Route::resource('roles', RoleController::class);
    });

    /*
    |--------------------------------------------------------------------------
    | HEALTHWORKER ONLY
    |--------------------------------------------------------------------------
    */
    Route::middleware(['role:Healthworker'])->group(function () {

        Route::resource('stocks', StockController::class)->except(['show']);
        Route::get('/api/stocks-for-barangay', [StockController::class, 'apiListForBarangay'])
            ->name('stocks.api.forBarangay');

        Route::post('/recommendations', [RecommendationController::class, 'generate'])
            ->name('recommendations.generate');
    });

    /*
    |--------------------------------------------------------------------------
    | HEALTHLOGS
    | Admin = View only
    | Healthworker = Full access
    |--------------------------------------------------------------------------
    */
    Route::prefix('healthlogs')->group(function () {

        // Create & Store
        Route::middleware(['role:Healthworker'])->group(function () {
            Route::get('/create', [HealthlogController::class, 'create'])->name('healthlogs.create');
            Route::post('/', [HealthlogController::class, 'store'])->name('healthlogs.store');
        });

        // Edit / Update / Delete
        Route::middleware(['role:Healthworker'])->group(function () {
            Route::get('/{healthlog}/edit', [HealthlogController::class, 'edit'])->name('healthlogs.edit');
            Route::put('/{healthlog}', [HealthlogController::class, 'update'])->name('healthlogs.update');
            Route::delete('/{healthlog}', [HealthlogController::class, 'destroy'])->name('healthlogs.destroy');
        });

        // View (Admin + Healthworker)
        Route::middleware(['role:Admin|Healthworker'])->group(function () {
            Route::get('/', [HealthlogController::class, 'index'])->name('healthlogs.index');
            Route::get('/{healthlog}', [HealthlogController::class, 'show'])->name('healthlogs.show');
        });
    });

});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
