<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('child_vitamin_doses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('child_vitamin_id')->constrained('child_vitamins')->cascadeOnDelete();
            $table->integer('dose_number');
            $table->date('date_given')->nullable();
            $table->date('next_due_date')->nullable();
            $table->text('remarks')->nullable();
            $table->foreignId('administered_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('child_vitamin_doses');
    }
};
