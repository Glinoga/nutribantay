<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;    
use App\Http\Controllers\RegistrationCodeController;
use App\Http\Controllers\ChildController;
use App\Http\Controllers\AnnouncementController;


Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('/announcements', function () {
    return Inertia::render('Announcements/GuestAnnouncements');
});
Route::get('/announcements/{id}', [AnnouncementController::class, 'show']);

    //Routes for all users
Route::middleware(['auth', 'verified', 'role:Admin|Healthworker'])->group(function () {
    Route::get('dashboard', fn() => Inertia::render('dashboard'))->name('dashboard');
    Route::resource('children', ChildController::class);
     Route::get('/worker/announcements', [AnnouncementController::class, 'adminIndex'])->name('dashboard.announcements');
    Route::post('/worker/announcements', [AnnouncementController::class, 'store']);
    Route::put('/worker/announcements/{id}', [AnnouncementController::class, 'update']);
    Route::delete('/worker/announcements/{id}', [AnnouncementController::class, 'destroy']);



    //Admin
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
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
