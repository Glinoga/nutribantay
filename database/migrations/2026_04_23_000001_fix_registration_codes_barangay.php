<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Drop the foreign key first (if exists)
        Schema::table('registration_codes', function (Blueprint $table) {
            // Drop index first (foreign key constraint)
            if (DB::getDriverName() === 'mysql') {
                DB::statement('ALTER TABLE registration_codes DROP INDEX registration_codes_barangay_index');
            }
            $table->string('barangay', 255)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('registration_codes', function (Blueprint $table) {
            $table->unsignedBigInteger('barangay')->nullable()->change();
            $table->index('barangay');
        });
    }
};