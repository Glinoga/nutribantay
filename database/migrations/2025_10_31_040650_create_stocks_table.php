<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('stocks', function (Blueprint $table) {
            $table->id();
            $table->string('barangay')->index(); // which barangay this stock belongs to
            $table->string('item_name');         // e.g. "Vitamin A", "Lugaw"
            $table->enum('category', ['food','vitamin','medicine','other'])->default('food');
            $table->integer('quantity')->default(0);
            $table->string('unit')->nullable();   // e.g. "pcs", "bottles", "kg"
            $table->date('expiry_date')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stocks');
    }
};
