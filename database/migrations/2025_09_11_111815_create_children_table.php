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
            $table->id(); // auto-incrementing ID (1, 2, 3, …)
            $table->string('name');
            $table->enum('sex', ['Male', 'Female']);
            $table->integer('age');
            $table->string('barangay')->nullable();
            $table->decimal('weight', 5, 2)->nullable();
            $table->decimal('height', 5, 2)->nullable();
            $table->timestamp('updated_at')->nullable()->change();
            $table->unsignedBigInteger('created_by'); // user ID (healthworker/admin)
            $table->timestamps();
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
