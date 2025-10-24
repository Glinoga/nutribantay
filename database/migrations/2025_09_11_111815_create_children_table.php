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
            $table->integer('age')->nullable(); 
            $table->date('birthdate')->nullable(); 
            $table->string('barangay')->nullable();
            $table->decimal('weight', 5, 2)->nullable();
            $table->decimal('height', 5, 2)->nullable();
            $table->string('address')->nullable();
            $table->string('contact_number')->nullable(); // ✅ fixed naming
            $table->unsignedBigInteger('created_by'); // user who created record
            $table->unsignedBigInteger('updated_by')->nullable(); // optional updater
            $table->timestamps();

            // ✅ Foreign key relationships
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');
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
