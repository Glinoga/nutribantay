<?php

use App\Http\Controllers\CategoryController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\RegistrationCodeController;
use App\Http\Controllers\ChildController;
use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\ContactController;

// Guest Pages
Route::get('/', function () {
    $announcements = \App\Models\Announcement::with('category')
        ->whereDate('date', '<=', now())
        ->where(function ($query) {
            $query->whereNull('end_date')
                ->orWhereDate('end_date', '>=', now());
        })
        ->latest()
        ->take(3) // Only show 3 latest announcements
        ->get();
    
    return Inertia::render('home', [
        'announcements' => $announcements
    ]);
})->name('home');

Route::get('/guest/announcements', [AnnouncementController::class, 'guestIndex'])->name('guest.announcements');
Route::get('/guest/announcements/{announcement}', [AnnouncementController::class, 'guestShow'])->name('guest.announcements.show');
Route::get('/guest/contact', [ContactController::class, 'showContactForm'])->name('guest.contact');
Route::post('/guest/contact', [ContactController::class, 'sendContactForm'])->name('guest.contact.send');

// Routes for authenticated users
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', fn() => Inertia::render('dashboard'))->name('dashboard');
    Route::resource('children', ChildController::class);
    // Route::resource('announcements', AnnouncementController::class);

    //Admin
    Route::middleware(['role:Admin'])->group(function () {
        Route::get('/users/archived', [UserController::class, 'archived'])->name('users.archived');
        Route::post('/users/{id}/restore', [UserController::class, 'restore'])->name('users.restore');
        Route::delete('/users/{id}/force-delete', [UserController::class, 'forceDelete'])->name('users.forceDelete');
        Route::post('/users/{id}/update-role', [UserController::class, 'updateRole'])->name('users.updateRole');
        Route::post('/registration-codes/generate', [RegistrationCodeController::class, 'generate']);
        Route::get('/registration-codes/latest', [RegistrationCodeController::class, 'latest']);

        //Announcements
        Route::get('/admin/announcements',  [App\Http\Controllers\AnnouncementController::class, 'index'])->name('announcements.index');
        Route::post('/admin/announcements/store',  [App\Http\Controllers\AnnouncementController::class, 'store'])->name('announcements.store');
        // Route::get('/admin/announcements/create', [App\Http\Controllers\AnnouncementController::class, 'create'])->name('announcements.create');
        Route::get('/admin/announcements/{announcement}/edit', [AnnouncementController::class, 'edit'])->name('announcements.edit');
        Route::put('/admin/announcements/{announcement}', [App\Http\Controllers\AnnouncementController::class, 'update'])->name('announcements.update');
        Route::delete('/admin/announcements/{announcement}', [App\Http\Controllers\AnnouncementController::class, 'destroy'])->name('announcements.destroy');

        Route::resource('categories', CategoryController::class);


        Route::resource('users', UserController::class);
        Route::resource('roles', RoleController::class);
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
