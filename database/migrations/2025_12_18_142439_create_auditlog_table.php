<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            
            // User who performed the action
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('user_name')->nullable(); // Store name in case user is deleted
            
            // What was done
            $table->string('action'); // created, updated, deleted, archived, restored, etc.
            $table->string('model_type'); // Child, User, System, etc.
            $table->unsignedBigInteger('model_id')->nullable(); // ID of the affected record
            $table->string('model_name')->nullable(); // Name/identifier of the record
            
            // Additional context
            $table->text('description')->nullable(); // Human-readable description
            $table->json('old_values')->nullable(); // Before state
            $table->json('new_values')->nullable(); // After state
            
            // Metadata
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->string('barangay')->nullable(); // For filtering by barangay
            
            $table->timestamps();
            
            // Indexes for faster queries
            $table->index(['user_id', 'created_at']);
            $table->index(['model_type', 'model_id']);
            $table->index(['action']);
            $table->index(['created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};