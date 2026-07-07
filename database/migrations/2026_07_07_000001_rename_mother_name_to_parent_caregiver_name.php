<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('children', function (Blueprint $table) {
            $table->renameColumn('mother_name', 'parent_caregiver_name');
        });
    }

    public function down(): void
    {
        Schema::table('children', function (Blueprint $table) {
            $table->renameColumn('parent_caregiver_name', 'mother_name');
        });
    }
};
