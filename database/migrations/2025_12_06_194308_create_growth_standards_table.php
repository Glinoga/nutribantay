<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('growth_standards', function (Blueprint $table) {
            $table->id();

            // Gender: "boy" / "girl"
            $table->string('gender', 10);

            // Type: weight_for_age, length_for_age, weight_for_length, weight_for_height
            $table->string('type', 30);

            // Age in months or height/length in centimeters
            $table->decimal('measure_value', 5, 2);

            // WHO Standard deviation cutoffs
            $table->decimal('sd_neg_3', 6, 2)->nullable();
            $table->decimal('sd_neg_2', 6, 2)->nullable();
            $table->decimal('sd_plus_2', 6, 2)->nullable();
            $table->decimal('sd_plus_3', 6, 2)->nullable();

            $table->timestamps();

            // Optimize search speed (very important)
            $table->index(['gender', 'type', 'measure_value']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('growth_standards');
    }
};
