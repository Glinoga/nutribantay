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

            // ---- Name Fields ----
            $table->string('first_name');
            $table->string('middle_initial')->nullable();
            $table->string('last_name');

            // ---- Personal Info ----
            $table->enum('sex', ['Male', 'Female']);
            $table->integer('age')->nullable();
            $table->date('birthdate')->nullable();

            // ---- Location / Contact ----
            $table->string('barangay')->nullable();
            $table->string('address')->nullable();
            $table->string('contact_number')->nullable();

            // ---- Anthropometric Data ----
            $table->decimal('weight', 5, 2)->nullable();
            $table->decimal('height', 5, 2)->nullable();

            // ---- User Tracking ----
            $table->unsignedBigInteger('created_by');
            $table->unsignedBigInteger('updated_by')->nullable();

            $table->timestamps();

            // ---- Foreign Keys ----
            $table->foreign('created_by')
                  ->references('id')
                  ->on('users')
                  ->onDelete('cascade');

            $table->foreign('updated_by')
                  ->references('id')
                  ->on('users')
                  ->onDelete('set null');
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
