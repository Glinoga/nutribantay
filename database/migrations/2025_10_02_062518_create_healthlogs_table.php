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
            $table->foreignId('child_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            $table->float('weight')->nullable();
            $table->float('height')->nullable();
            $table->float('bmi')->nullable();

            $table->float('zscore_wfa')->nullable();
            $table->float('zscore_lfa')->nullable();
            $table->float('zscore_wfh')->nullable();

            $table->string('nutrition_status')->nullable();
            $table->string('micronutrient_powder')->nullable();
            $table->string('ruf')->nullable();
            $table->string('rusf')->nullable();
            $table->string('complementary_food')->nullable();

            $table->boolean('vitamin_a')->default(false);
            $table->boolean('deworming')->default(false);

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
        Schema::dropIfExists('healthlogs');
    }
};
