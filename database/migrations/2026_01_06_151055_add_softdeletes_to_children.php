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
        // Only add softDeletes if the column doesn't already exist
        // (it may have been added in the original create_children_table migration)
        if (! Schema::hasColumn('children', 'deleted_at')) {
            Schema::table('children', function (Blueprint $table) {
                $table->softDeletes();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('children', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
    }
};
