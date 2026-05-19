<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('dashboard_cache', function (Blueprint $table) {
            $table->integer('vitamin_overdue')->default(0)->after('vaccine_upcoming');
            $table->integer('vitamin_upcoming')->default(0)->after('vitamin_overdue');
        });
    }

    public function down(): void
    {
        Schema::table('dashboard_cache', function (Blueprint $table) {
            $table->dropColumn(['vitamin_overdue', 'vitamin_upcoming']);
        });
    }
};
