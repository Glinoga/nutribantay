<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $duplicates = DB::table('children')
            ->select('barangay', 'first_name', 'last_name', 'birthdate')
            ->selectRaw('COUNT(*) as count')
            ->groupBy('barangay', 'first_name', 'last_name', 'birthdate')
            ->having('count', '>', 1)
            ->get();

        foreach ($duplicates as $dup) {
            $keep = DB::table('children')
                ->where('barangay', $dup->barangay)
                ->where('first_name', $dup->first_name)
                ->where('last_name', $dup->last_name)
                ->where('birthdate', $dup->birthdate)
                ->orderBy('created_at', 'desc')
                ->first();

            $deleted = DB::table('children')
                ->where('barangay', $dup->barangay)
                ->where('first_name', $dup->first_name)
                ->where('last_name', $dup->last_name)
                ->where('birthdate', $dup->birthdate)
                ->where('id', '!=', $keep->id)
                ->delete();

            Log::info("Cleaned up {$deleted} duplicate(s): {$dup->first_name} {$dup->last_name}, barangay {$dup->barangay}, kept ID {$keep->id}");
        }

        Schema::table('children', function (Blueprint $table) {
            $table->unique(['barangay', 'first_name', 'last_name', 'birthdate'], 'children_unique_name_dob');
        });
    }

    public function down(): void
    {
        Schema::table('children', function (Blueprint $table) {
            $table->dropUnique('children_unique_name_dob');
        });
    }
};
