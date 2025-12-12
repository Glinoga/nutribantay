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
            // Added age_in_months to freeze the age at the time of checkup
            $table->integer('age_in_months')->nullable(); 
            $table->decimal('weight', 5, 2)->nullable();
            $table->decimal('height', 5, 2)->nullable();
            $table->decimal('bmi', 5, 2)->nullable();

            // Nutrition Status (Changed from 'decimal' zscore to 'string' status)
            // These will store values like: "Normal", "Severely Wasted", "Stunted"
            $table->string('status_wfa')->nullable(); // Weight for Age Status
            $table->string('status_lfa')->nullable(); // Length/Height for Age Status
            $table->string('status_wfl_wfh')->nullable(); // Weight for Length/Height Status

            // Nutrition & supplements
            // This can store the "Overall" status (e.g., if any of the above are bad)
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