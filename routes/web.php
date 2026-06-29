<?php

use App\Http\Controllers\Admin\WebsiteManagementController;
use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ChildController;
use App\Http\Controllers\ChildVaccineController;
use App\Http\Controllers\ChildVitaminController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DatabaseMaintenanceController;
use App\Http\Controllers\HealthlogController;
use App\Http\Controllers\RecommendationController;
use App\Http\Controllers\RegistrationCodeController;
use App\Http\Controllers\SMSController;
use App\Http\Controllers\SystemController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\VaccineController;
use App\Http\Controllers\VitaminController;
use App\Models\Announcement;
use App\Models\SiteContent;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Guest Pages
Route::get('/', function () {
    $announcements = Announcement::with('category')
        ->whereDate('date', '<=', now())
        ->where(function ($query) {
            $query->whereNull('end_date')
                ->orWhereDate('end_date', '>=', now());
        })
        ->latest()
        ->take(3) // Only show 3 latest announcements
        ->get();

    return Inertia::render('home', [
        'announcements' => $announcements,
        'siteContent' => SiteContent::getByPage('home'),
    ]);
})->name('home');

Route::get('/guest/announcements', [AnnouncementController::class, 'guestIndex'])->name('guest.announcements');
Route::get('/guest/announcements/{announcement}', [AnnouncementController::class, 'guestShow'])->name('guest.announcements.show');
Route::get('/guest/contact', [ContactController::class, 'showContactForm'])->name('guest.contact');
Route::post('/guest/contact', [ContactController::class, 'sendContactForm'])
    ->middleware('throttle:3,10')
    ->name('guest.contact.send');

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
    | CHILDREN (Admin + Healthworker only)
    |--------------------------------------------------------------------------
    */
    Route::middleware(['role:Admin|Healthworker'])->group(function () {
        Route::get('/children-archived', [ChildController::class, 'archived'])->name('children.archived');
        Route::post('/children/{id}/restore', [ChildController::class, 'restore'])->name('children.restore');
        Route::delete('/children/{id}/force-delete', [ChildController::class, 'forceDelete'])->name('children.force-delete');
        Route::get('/children/export', [ChildController::class, 'export'])->name('children.export');
        Route::get('/children/print', [ChildController::class, 'print'])->name('children.print');
        Route::post('/children/import', [ChildController::class, 'import'])->name('children.import');
        Route::resource('children', ChildController::class);
        Route::get('/children/{child}/print', [ChildController::class, 'showPrint'])->name('children.show.print');
        Route::get('/children/{child}/export', [ChildController::class, 'exportSingle'])->name('children.export.single');
        Route::post('/children/{child}/notes', [ChildController::class, 'storeNote'])->name('children.notes.store');
        Route::delete('/children/{child}/notes/{note}', [ChildController::class, 'destroyNote'])->name('children.notes.destroy');
    });

    /*
    |--------------------------------------------------------------------------
    | HEALTHLOG ROUTES (Child-centric only - Healthworker only)
    |--------------------------------------------------------------------------
    */
    Route::middleware(['role:Admin|Healthworker', 'throttle:30,1'])->group(function () {
        Route::get('/children/{child}/healthlogs/create', [HealthlogController::class, 'createForChild'])->name('children.healthlogs.create');
        Route::post('/children/{child}/healthlogs', [HealthlogController::class, 'storeForChild'])->name('children.healthlogs.store');
    });

    /*
    |--------------------------------------------------------------------------
    | HEALTHLOG EDIT/UPDATE/DELETE (Admin + Healthworker)
    |--------------------------------------------------------------------------
    */
    Route::middleware(['role:Admin|Healthworker', 'throttle:30,1'])->group(function () {
        Route::get('/healthlogs/{healthlog}/edit', [HealthlogController::class, 'edit'])->name('healthlogs.edit');
        Route::put('/healthlogs/{healthlog}', [HealthlogController::class, 'update'])->name('healthlogs.update');
        Route::delete('/healthlogs/{healthlog}', [HealthlogController::class, 'destroy'])->name('healthlogs.destroy');

    });

    /*
    |--------------------------------------------------------------------------
    | VACCINE CATALOG (Admin + Healthworker)
    |--------------------------------------------------------------------------
    */
    Route::middleware(['role:Admin|Healthworker'])->group(function () {
        Route::resource('vaccines', VaccineController::class)->except(['show']);
    });

    /*
    |--------------------------------------------------------------------------
    | VITAMIN CATALOG (Admin + Healthworker)
    |--------------------------------------------------------------------------
    */
    Route::middleware(['role:Admin|Healthworker'])->group(function () {
        Route::resource('vitamins', VitaminController::class)->except(['show']);
    });

    /*
    |--------------------------------------------------------------------------
    | CHILD VITAMIN TRACKING (Admin + Healthworker)
    |--------------------------------------------------------------------------
    */
    Route::middleware(['role:Admin|Healthworker'])->group(function () {
        Route::get('/children/{child}/vitamins', [ChildVitaminController::class, 'index'])->name('children.vitamins.index');
        Route::post('/children/{child}/vitamins', [ChildVitaminController::class, 'store'])->name('children.vitamins.store');
        Route::delete('/children/{child}/vitamins/{childVitamin}', [ChildVitaminController::class, 'destroy'])->name('children.vitamins.destroy');
        Route::post('/children/{child}/vitamins/{childVitamin}/doses', [ChildVitaminController::class, 'recordDose'])->name('children.vitamins.doses.store');
        Route::patch('/children/{child}/vitamins/{childVitamin}/doses/{dose}', [ChildVitaminController::class, 'updateDose'])->name('children.vitamins.doses.update');
        Route::delete('/children/{child}/vitamins/{childVitamin}/doses/{dose}', [ChildVitaminController::class, 'destroyDose'])->name('children.vitamins.doses.destroy');
    });

    /*
    |--------------------------------------------------------------------------
    | CHILD VACCINE TRACKING (Admin + Healthworker)
    |--------------------------------------------------------------------------
    */
    Route::middleware(['role:Admin|Healthworker'])->group(function () {
        Route::get('/children/{child}/vaccines', [ChildVaccineController::class, 'index'])->name('children.vaccines.index');
        Route::post('/children/{child}/vaccines', [ChildVaccineController::class, 'store'])->name('children.vaccines.store');
        Route::delete('/children/{child}/vaccines/{childVaccine}', [ChildVaccineController::class, 'destroy'])->name('children.vaccines.destroy');
        Route::post('/children/{child}/vaccines/{childVaccine}/doses', [ChildVaccineController::class, 'recordDose'])->name('children.vaccines.doses.store');
        Route::patch('/children/{child}/vaccines/{childVaccine}/doses/{dose}', [ChildVaccineController::class, 'updateDose'])->name('children.vaccines.doses.update');
        Route::delete('/children/{child}/vaccines/{childVaccine}/doses/{dose}', [ChildVaccineController::class, 'destroyDose'])->name('children.vaccines.doses.destroy');
    });

    /*
    |--------------------------------------------------------------------------
    | ADMIN ONLY
    |--------------------------------------------------------------------------
    */
    Route::middleware(['role:Admin'])->group(function () {
        Route::get('/users/archived', [UserController::class, 'archived'])->name('users.archived');
        Route::post('/users/{id}/restore', [UserController::class, 'restore'])->name('users.restore');
        Route::delete('/users/{id}/force-delete', [UserController::class, 'forceDelete'])->name('users.force-delete');
        Route::post('/users/{id}/approve', [UserController::class, 'approve'])->name('users.approve');
        Route::post('/users/{id}/reject', [UserController::class, 'reject'])->name('users.reject');
        Route::post('/users/{id}/reset-password', [UserController::class, 'resetPassword'])->name('users.reset-password');
        Route::post('/users/store-bulk', [UserController::class, 'storeBulk'])->name('users.store-bulk');

        Route::post('/registration-codes/generate', [RegistrationCodeController::class, 'generate'])->name('registration-codes.generate');
        Route::get('/registration-codes/latest', [RegistrationCodeController::class, 'latest'])->name('registration-codes.latest');
        Route::get('/registration-codes', [RegistrationCodeController::class, 'index'])->name('registration-codes.index');
        Route::delete('/registration-codes/{id}', [RegistrationCodeController::class, 'destroy'])->name('registration-codes.destroy');
        Route::get('/maintenance/status', [SystemController::class, 'status']);
        Route::post('/maintenance/toggle', [SystemController::class, 'toggle']);
        Route::get('/admin/database', [DatabaseMaintenanceController::class, 'index'])
            ->name('admin.database.index')
            ->middleware('role:Admin');

        Route::post('/admin/database/backup', [DatabaseMaintenanceController::class, 'backup'])
            ->name('admin.database.backup')
            ->middleware('role:Admin');

        Route::get('/admin/database/list', [DatabaseMaintenanceController::class, 'list'])
            ->name('admin.database.list')
            ->middleware('role:Admin');

        Route::post('/admin/database/restore', [DatabaseMaintenanceController::class, 'restore'])
            ->name('admin.database.restore')
            ->middleware('role:Admin');

        Route::delete('/admin/database/delete', [DatabaseMaintenanceController::class, 'delete'])
            ->name('admin.database.delete')
            ->middleware('role:Admin');

        Route::get('/audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');
        Route::get('/audit-logs/export', [AuditLogController::class, 'export'])->name('audit-logs.export');
        Route::get('/audit-logs/{auditLog}', [AuditLogController::class, 'show'])->name('audit-logs.show');

        Route::resource('categories', CategoryController::class);

        Route::resource('users', UserController::class);

        // Website Management
        Route::get('/admin/website-management', [WebsiteManagementController::class, 'index'])
            ->name('admin.website.index');
        Route::put('/admin/website-management', [WebsiteManagementController::class, 'update'])
            ->name('admin.website.update');
        Route::post('/admin/website-management/upload-logo', [WebsiteManagementController::class, 'uploadLogo'])
            ->name('admin.website.upload-logo');
    });

    /*
    |--------------------------------------------------------------------------
    | SEND SMS (Admin + Healthworker)
    |--------------------------------------------------------------------------
    */
    Route::middleware(['role:Admin|Healthworker'])->group(function () {
        Route::get('/admin/sendsms', [SMSController::class, 'index'])
            ->middleware('throttle:60,1')
            ->name('sms.index');
        Route::post('/admin/sendsms', [SMSController::class, 'send'])
            ->middleware('throttle:20,1')
            ->name('sms.send');
    });

    /*
    |--------------------------------------------------------------------------
    | ANNOUNCEMENTS (Admin + Healthworker)
    |--------------------------------------------------------------------------
    */
    Route::middleware(['role:Admin|Healthworker'])->group(function () {
        Route::get('/admin/announcements', [AnnouncementController::class, 'index'])->name('announcements.index');
        Route::get('/admin/announcements/create', [AnnouncementController::class, 'create'])->name('announcements.create');
        Route::post('/admin/announcements/store', [AnnouncementController::class, 'store'])->name('announcements.store');
        Route::get('/admin/announcements/{announcement}/edit', [AnnouncementController::class, 'edit'])->name('announcements.edit');
        Route::put('/admin/announcements/{announcement}', [AnnouncementController::class, 'update'])->name('announcements.update');
        Route::delete('/admin/announcements/{announcement}', [AnnouncementController::class, 'destroy'])->name('announcements.destroy');
        Route::delete('/admin/announcements/{announcement}/images/{image}', [AnnouncementController::class, 'destroyImage'])->name('announcements.images.destroy');
        Route::post('/admin/announcements/{announcement}/images/reorder', [AnnouncementController::class, 'reorderImages'])->name('announcements.images.reorder');

        // Archived announcements
        Route::get('/admin/announcements-archived', [AnnouncementController::class, 'archived'])->name('announcements.archived');
        Route::post('/admin/announcements/{id}/restore', [AnnouncementController::class, 'restore'])->name('announcements.restore');
        Route::delete('/admin/announcements/{id}/force-delete', [AnnouncementController::class, 'forceDelete'])->name('announcements.force-delete');
    });

    Route::post('/recommendations', [RecommendationController::class, 'generate'])->middleware('throttle:recommendations')->name('recommendations.generate');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
