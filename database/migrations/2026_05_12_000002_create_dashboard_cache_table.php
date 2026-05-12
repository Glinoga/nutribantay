<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dashboard_cache', function (Blueprint $table) {
            $table->id();
            $table->string('barangay')->unique();
            $table->integer('total_children')->default(0);
            $table->integer('total_health_logs')->default(0);
            $table->json('nutrition_breakdown')->nullable();
            $table->json('age_breakdown')->nullable();
            $table->json('monthly_logs')->nullable();
            $table->integer('vaccine_overdue')->default(0);
            $table->integer('vaccine_upcoming')->default(0);
            $table->integer('today_children')->default(0);
            $table->integer('today_health_logs')->default(0);
            $table->integer('week_health_logs')->default(0);
            $table->integer('month_health_logs')->default(0);
            $table->integer('year_health_logs')->default(0);
            $table->decimal('avg_bmi', 5, 2)->nullable();
            $table->integer('male_count')->default(0);
            $table->integer('female_count')->default(0);
            $table->integer('vitamin_a_given')->default(0);
            $table->integer('deworming_given')->default(0);
            $table->integer('total_with_logs')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dashboard_cache');
    }
};
