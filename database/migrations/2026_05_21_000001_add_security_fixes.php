<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('email')->nullable()->change();
        });

        Schema::table('child_vaccine_doses', function (Blueprint $table) {
            $table->unique(['child_vaccine_id', 'dose_number'], 'vax_dose_unique');
        });

        Schema::table('child_vitamin_doses', function (Blueprint $table) {
            $table->unique(['child_vitamin_id', 'dose_number'], 'vit_dose_unique');
        });
    }

    public function down(): void
    {
        Schema::table('child_vitamin_doses', function (Blueprint $table) {
            $table->dropUnique('vit_dose_unique');
        });

        Schema::table('child_vaccine_doses', function (Blueprint $table) {
            $table->dropUnique('vax_dose_unique');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->string('email')->nullable(false)->change();
        });
    }
};
