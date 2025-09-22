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
    Schema::create('child_notes', function (Blueprint $table) {
        $table->id();
        $table->foreignId('child_id')->constrained()->onDelete('cascade');
        $table->foreignId('user_id')->constrained()->onDelete('cascade'); // healthworker who wrote the note
        $table->text('note');
        $table->timestamps();
    });
}

public function down(): void
{
    Schema::dropIfExists('child_notes');
}

};
