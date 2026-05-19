<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('child_vitamin_doses', function (Blueprint $table) {
            $table->unique(['child_vitamin_id', 'dose_number'], 'idx_cvd_vitamin_dose');
        });
    }

    public function down(): void
    {
        Schema::table('child_vitamin_doses', function (Blueprint $table) {
            $table->dropUnique('idx_cvd_vitamin_dose');
        });
    }
};
