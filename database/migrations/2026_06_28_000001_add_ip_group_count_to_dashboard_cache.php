<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('dashboard_cache', function (Blueprint $table) {
            $table->integer('ip_group_count')->default(0)->after('total_with_logs');
        });
    }

    public function down(): void
    {
        Schema::table('dashboard_cache', function (Blueprint $table) {
            $table->dropColumn('ip_group_count');
        });
    }
};
