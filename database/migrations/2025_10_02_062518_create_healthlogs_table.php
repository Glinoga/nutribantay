<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('health_logs', function (Blueprint $table) {
            $table->id();

            // Relations
            $table->foreignId('child_id')->constrained('children')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');

            // Anthropometric data
            $table->decimal('weight', 5, 2)->nullable();
            $table->decimal('height', 5, 2)->nullable();
            $table->decimal('bmi', 5, 2)->nullable();

            // Z-scores
            $table->decimal('zscore_wfa', 5, 2)->nullable();
            $table->decimal('zscore_lfa', 5, 2)->nullable();
            $table->decimal('zscore_wfh', 5, 2)->nullable();

            // Nutrition & supplements
            $table->string('nutrition_status')->nullable();
            $table->string('micronutrient_powder')->nullable();
            $table->string('ruf')->nullable();
            $table->string('rusf')->nullable();
            $table->string('complementary_food')->nullable();

            // Health interventions
            $table->boolean('vitamin_a')->default(false);
            $table->boolean('deworming')->default(false);

            // Vaccination info
            $table->string('vaccine_name')->nullable();
            $table->integer('dose_number')->nullable();
            $table->date('date_given')->nullable();
            $table->date('next_due_date')->nullable();
            $table->string('vaccine_status')->nullable();

            $table->timestamps();
            $table->text('recommendation')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('health_logs');
    }
};
