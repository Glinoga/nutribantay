<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;    
use App\Http\Controllers\RegistrationCodeController;
use App\Http\Controllers\ChildController;


// Guest Pages
Route::get('/', function () {
    return Inertia::render('home');
})->name('home');

Route::get('/announcements', function () {
    return Inertia::render('announcements');
})->name('announcements');

Route::get('/contact', function () {
    return Inertia::render('contact');
})->name('contact');

// Routes for authenticated users
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', fn() => Inertia::render('dashboard'))->name('dashboard');
    Route::resource('children', ChildController::class);
    Route::post('/children/{child}/notes', [ChildController::class, 'storeNote'])->name('children.notes.store');
    
    Route::delete('/children/{child}/notes/{note}', [ChildController::class, 'destroyNote'])->name('children.notes.destroy');

    


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
