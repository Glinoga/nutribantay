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
        Schema::create('registration_codes', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('barangay', 255)->nullable();
            $table->boolean('is_used')->default(false);
            $table->integer('code_number')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });

        // Add foreign key to users table (users table already exists from previous migration)
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('registration_code_id')->nullable()->constrained('registration_codes')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['registration_code_id']);
            $table->dropColumn('registration_code_id');
        });
        Schema::dropIfExists('registration_codes');
    }
};
