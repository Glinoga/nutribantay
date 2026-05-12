<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('children', function (Blueprint $table) {
            $table->index(['barangay', 'deleted_at'], 'idx_children_barangay_deleted');
            $table->index(['barangay', 'birthdate'], 'idx_children_barangay_birthdate');
        });

        Schema::table('health_logs', function (Blueprint $table) {
            $table->index(['child_id', 'created_at'], 'idx_health_logs_child_date');
            $table->index('created_at', 'idx_health_logs_created_at');
            $table->index('deleted_at', 'idx_health_logs_deleted_at');
        });

        Schema::table('child_vaccine_doses', function (Blueprint $table) {
            $table->index(['next_due_date', 'date_given'], 'idx_cvd_due_date');
            $table->unique(['child_vaccine_id', 'dose_number'], 'idx_cvd_vaccine_dose');
        });

        Schema::table('audit_logs', function (Blueprint $table) {
            $table->index(['barangay', 'created_at'], 'idx_audit_logs_barangay_date');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->index(['barangay', 'status'], 'idx_users_barangay_status');
            $table->index('deleted_at', 'idx_users_deleted_at');
        });

        Schema::table('announcements', function (Blueprint $table) {
            $table->index('deleted_at', 'idx_announcements_deleted_at');
        });
    }

    public function down(): void
    {
        Schema::table('children', function (Blueprint $table) {
            $table->dropIndex('idx_children_barangay_deleted');
            $table->dropIndex('idx_children_barangay_birthdate');
        });

        Schema::table('health_logs', function (Blueprint $table) {
            $table->dropIndex('idx_health_logs_child_date');
            $table->dropIndex('idx_health_logs_created_at');
            $table->dropIndex('idx_health_logs_deleted_at');
        });

        Schema::table('child_vaccine_doses', function (Blueprint $table) {
            $table->dropIndex('idx_cvd_due_date');
            $table->dropUnique('idx_cvd_vaccine_dose');
        });

        Schema::table('audit_logs', function (Blueprint $table) {
            $table->dropIndex('idx_audit_logs_barangay_date');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('idx_users_barangay_status');
            $table->dropIndex('idx_users_deleted_at');
        });

        Schema::table('announcements', function (Blueprint $table) {
            $table->dropIndex('idx_announcements_deleted_at');
        });
    }
};
