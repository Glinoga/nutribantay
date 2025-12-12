<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\RegistrationCodeController;
use App\Http\Controllers\ChildController;
use App\Http\Controllers\HealthlogController;

// Public pages
Route::get('/', fn() => Inertia::render('home'))->name('home');
Route::get('/announcements', fn() => Inertia::render('announcements'))->name('announcements');
Route::get('/contact', fn() => Inertia::render('contact'))->name('contact');

// Authenticated routes
Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('/dashboard', fn() => Inertia::render('dashboard'))->name('dashboard');

    /*
    |--------------------------------------------------------------------------
    | CHILDREN ROUTES
    |--------------------------------------------------------------------------
    */
    Route::resource('children', ChildController::class);
    Route::post('/children/{child}/notes', [ChildController::class, 'storeNote'])->name('children.notes.store');
    Route::delete('/children/{child}/notes/{note}', [ChildController::class, 'destroyNote'])->name('children.notes.destroy');


    /*
    |--------------------------------------------------------------------------
    | ADMIN-ONLY ROUTES
    |--------------------------------------------------------------------------
    */
    Route::middleware(['role:Admin'])->group(function () {
        Route::get('/users/archived', [UserController::class, 'archived'])->name('users.archived');
        Route::post('/users/{id}/restore', [UserController::class, 'restore'])->name('users.restore');
        Route::delete('/users/{id}/force-delete', [UserController::class, 'forceDelete'])->name('users.forceDelete');
        Route::post('/users/{id}/update-role', [UserController::class, 'updateRole'])->name('users.updateRole');

        Route::post('/registration-codes/generate', [RegistrationCodeController::class, 'generate']);
        Route::get('/registration-codes/latest', [RegistrationCodeController::class, 'latest']);

        Route::resource('users', UserController::class);
        Route::resource('roles', RoleController::class);
    });


    /*
    |--------------------------------------------------------------------------
    | HEALTHLOG ROUTES (Full Fix — Admin = view only, HW = full access)
    |--------------------------------------------------------------------------
    */

    Route::prefix('healthlogs')->group(function () {

        /*
        |----------------------------------------------------------
        | CREATE + STORE (Healthworker only)
        |----------------------------------------------------------
        */
        Route::middleware(['role:Healthworker'])->group(function () {
            Route::get('/create', [HealthlogController::class, 'create'])->name('healthlogs.create');
            Route::post('/', [HealthlogController::class, 'store'])->name('healthlogs.store');
        });

        /*
        |----------------------------------------------------------
        | EDIT + UPDATE + DELETE (Healthworker only)
        |----------------------------------------------------------
        */
        Route::middleware(['role:Healthworker'])->group(function () {
            Route::get('/{healthlog}/edit', [HealthlogController::class, 'edit'])->name('healthlogs.edit');
            Route::put('/{healthlog}', [HealthlogController::class, 'update'])->name('healthlogs.update');
            Route::delete('/{healthlog}', [HealthlogController::class, 'destroy'])->name('healthlogs.destroy');
        });

        /*
        |----------------------------------------------------------
        | VIEW ROUTES (Admin + Healthworker)
        | Must ALWAYS be last so it does NOT override /create
        |----------------------------------------------------------
        */
        Route::middleware(['role:Admin|Healthworker'])->group(function () {
            Route::get('/', [HealthlogController::class, 'index'])->name('healthlogs.index');
            Route::get('/{healthlog}', [HealthlogController::class, 'show'])->name('healthlogs.show');
        });

    });

});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
