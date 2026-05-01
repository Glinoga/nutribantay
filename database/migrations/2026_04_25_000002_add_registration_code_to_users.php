<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('registration_code_id')
                ->nullable()
                ->constrained('registration_codes')
                ->nullOnDelete();
        });

        Schema::table('registration_codes', function (Blueprint $table) {
            $table->integer('code_number')->nullable()->after('is_used');
            $table->string('barangay', 255)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['registration_code_id']);
            $table->dropColumn('registration_code_id');
        });

        Schema::table('registration_codes', function (Blueprint $table) {
            $table->dropColumn('code_number');
        });
    }
};
