<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('child_vitamins', function (Blueprint $table) {
            $table->id();
            $table->foreignId('child_id')->constrained('children')->cascadeOnDelete();
            $table->foreignId('vitamin_id')->constrained('vitamins')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['child_id', 'vitamin_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('child_vitamins');
    }
};
