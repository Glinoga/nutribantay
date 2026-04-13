<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('registration_codes', function (Blueprint $table) {
            $table->unsignedBigInteger('barangay')->nullable()->after('code');
            $table->index('barangay');
        });
    }

    public function down(): void
    {
        Schema::table('registration_codes', function (Blueprint $table) {
            $table->dropColumn('barangay');
        });
    }
};