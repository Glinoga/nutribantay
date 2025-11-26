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

Route::get('/', fn() => Inertia::render('home'))->name('home');
Route::get('/announcements', fn() => Inertia::render('announcements'))->name('announcements');
Route::get('/contact', fn() => Inertia::render('contact'))->name('contact');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', fn() => Inertia::render('dashboard'))->name('dashboard');

    Route::resource('children', ChildController::class);
    Route::post('/children/{child}/notes', [ChildController::class, 'storeNote'])->name('children.notes.store');
    Route::delete('/children/{child}/notes/{note}', [ChildController::class, 'destroyNote'])->name('children.notes.destroy');

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

    Route::middleware(['role:Healthworker'])->group(function () {
        Route::get('/healthlog', [HealthlogController::class, 'index'])->name('healthlog.index');
        Route::get('/healthlog/create', [HealthlogController::class, 'create'])->name('healthlog.create');
        Route::post('/healthlog', [HealthlogController::class, 'store'])->name('healthlog.store');
        Route::get('/healthlog/{id}', [HealthlogController::class, 'show'])->name('healthlog.show');
        Route::delete('/healthlog/{id}', [HealthlogController::class, 'destroy'])->name('healthlog.destroy');
        Route::post('/recommendations', [RecommendationController::class, 'generate'])->name('recommendations.generate');
        Route::resource('stocks', StockController::class)->except(['show']);
Route::get('/api/stocks-for-barangay', [StockController::class, 'apiListForBarangay'])->name('stocks.api.forBarangay');
        Route::resource('healthlogs', HealthlogController::class);
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
