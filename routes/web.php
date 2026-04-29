<?php

use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\ChildController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DatabaseMaintenanceController;
use App\Http\Controllers\HealthlogController;
use App\Http\Controllers\RecommendationController;
use App\Http\Controllers\RegistrationCodeController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\SystemController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CategoryController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\SMSController;

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

/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/dashboard/export', [DashboardController::class, 'export'])->name('dashboard.export');
    Route::get('/dashboard/print', [DashboardController::class, 'printView'])->name('dashboard.print');

    /*
    |--------------------------------------------------------------------------
    | CHILDREN
    |--------------------------------------------------------------------------
    */
    Route::get('/children-archived', [ChildController::class, 'archived'])->name('children.archived');
    Route::post('/children/{id}/restore', [ChildController::class, 'restore'])->name('children.restore');
    Route::delete('/children/{id}/force-delete', [ChildController::class, 'forceDelete'])->name('children.forceDelete');
    Route::get('/children/export', [ChildController::class, 'export'])
        ->name('children.export')
        ->middleware(['role:Admin|Healthworker']);
    Route::post('/children/import', [ChildController::class, 'import'])->name('children.import');
    Route::resource('children', ChildController::class);
    Route::post('/children/{child}/notes', [ChildController::class, 'storeNote'])->name('children.notes.store');
    Route::delete('/children/{child}/notes/{note}', [ChildController::class, 'destroyNote'])->name('children.notes.destroy');

    /*
    |--------------------------------------------------------------------------
    | HEALTHLOG ROUTES (Child-centric only - Healthworker only)
    |--------------------------------------------------------------------------
    */
    Route::middleware(['role:Healthworker'])->group(function () {
        Route::get('/children/{child}/healthlogs/create', [HealthlogController::class, 'createForChild'])->name('children.healthlogs.create');
        Route::post('/children/{child}/healthlogs', [HealthlogController::class, 'storeForChild'])->name('children.healthlogs.store');
    });

    /*
    |--------------------------------------------------------------------------
    | HEALTHLOG EDIT/UPDATE/DELETE (Healthworker only)
    |--------------------------------------------------------------------------
    */
    Route::middleware(['role:Healthworker'])->group(function () {
        Route::get('/healthlogs/{healthlog}/edit', [HealthlogController::class, 'edit'])->name('healthlogs.edit');
        Route::put('/healthlogs/{healthlog}', [HealthlogController::class, 'update'])->name('healthlogs.update');
        Route::delete('/healthlogs/{healthlog}', [HealthlogController::class, 'destroy'])->name('healthlogs.destroy');
    });

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
        Route::post('/users/{id}/approve', [UserController::class, 'approve'])->name('users.approve');
        Route::post('/users/{id}/reject', [UserController::class, 'reject'])->name('users.reject');
        Route::post('/users/store-bulk', [UserController::class, 'storeBulk'])->name('users.storeBulk');

        Route::post('/registration-codes/generate', [RegistrationCodeController::class, 'generate']);
        Route::get('/registration-codes/latest', [RegistrationCodeController::class, 'latest']);
        Route::get('/registration-codes', [RegistrationCodeController::class, 'index']);
        Route::delete('/registration-codes/{id}', [RegistrationCodeController::class, 'destroy']);
        Route::get('/maintenance/status', [SystemController::class, 'status']);
        Route::post('/maintenance/toggle', [SystemController::class, 'toggle']);
        Route::get('/admin/database', [DatabaseMaintenanceController::class, 'index'])
            ->name('admin.database.index');

        Route::post('/admin/database/backup', [DatabaseMaintenanceController::class, 'backup'])
            ->name('admin.database.backup');

        Route::get('/admin/database/list', [DatabaseMaintenanceController::class, 'list'])
            ->name('admin.database.list');

        Route::post('/admin/database/restore', [DatabaseMaintenanceController::class, 'restore'])
            ->name('admin.database.restore');

        Route::get('/admin/database/download/{filename}', [DatabaseMaintenanceController::class, 'download'])
            ->name('admin.database.download');

        Route::delete('/admin/database/delete', [DatabaseMaintenanceController::class, 'delete'])
            ->name('admin.database.delete');

        Route::get('/audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');
        Route::get('/audit-logs/export', [AuditLogController::class, 'export'])->name('audit-logs.export');
        Route::get('/audit-logs/{auditLog}', [AuditLogController::class, 'show'])->name('audit-logs.show');        //Announcements
        Route::get('/admin/announcements',  [App\Http\Controllers\AnnouncementController::class, 'index'])->name('announcements.index');
        Route::post('/admin/announcements/store',  [App\Http\Controllers\AnnouncementController::class, 'store'])->name('announcements.store');
        // Route::get('/admin/announcements/create', [App\Http\Controllers\AnnouncementController::class, 'create'])->name('announcements.create');
        Route::get('/admin/announcements/{announcement}/edit', [AnnouncementController::class, 'edit'])->name('announcements.edit');
        Route::put('/admin/announcements/{announcement}', [App\Http\Controllers\AnnouncementController::class, 'update'])->name('announcements.update');
        Route::delete('/admin/announcements/{announcement}', [App\Http\Controllers\AnnouncementController::class, 'destroy'])->name('announcements.destroy');

        Route::get('/admin/sendsms', [SMSController::class, 'index'])->name('sms.index');
        Route::post('/admin/sendsms', [SMSController::class, 'send'])->name('sms.send');

        Route::resource('categories', CategoryController::class);


        Route::resource('users', UserController::class);
    });

    Route::post('/recommendations', [RecommendationController::class, 'generate'])->name('recommendations.generate');
});

/*
|--------------------------------------------------------------------------
| STOCK ROUTES (Admin + Healthworker)
|--------------------------------------------------------------------------
*/
Route::prefix('stocks')->middleware(['role:Admin|Healthworker'])->group(function () {
    Route::get('/', [StockController::class, 'index'])->name('stocks.index');
    Route::get('/create', [StockController::class, 'create'])->name('stocks.create');
    Route::post('/', [StockController::class, 'store'])->name('stocks.store');
    Route::get('/{stock}/edit', [StockController::class, 'edit'])->name('stocks.edit');
    Route::put('/{stock}', [StockController::class, 'update'])->name('stocks.update');
    Route::delete('/{stock}', [StockController::class, 'destroy'])->name('stocks.destroy');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
