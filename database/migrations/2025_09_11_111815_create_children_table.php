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
        Schema::create('children', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('sex', ['Male', 'Female']);
            $table->integer('age')->nullable(); // optional
            $table->date('birthdate')->nullable(); // ✅ needed for z-scores
            $table->string('barangay')->nullable();
            $table->decimal('weight', 5, 2)->nullable();
            $table->decimal('height', 5, 2)->nullable();
            $table->string('address')->nullable();
            $table->string('contact_number')->nullable(); // ✅ fixed
            $table->unsignedBigInteger('created_by'); // user who created record
            $table->timestamps(); // ✅ automatically adds created_at and updated_at
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('children');
    }
};
