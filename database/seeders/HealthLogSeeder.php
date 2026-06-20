<?php

namespace Database\Seeders;

use App\Helpers\GrowthHelper;
use App\Models\Child;
use App\Models\HealthLog;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class HealthLogSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'nutribantay@gmail.com')->first();

        if (! $admin) {
            $this->command->warn('No admin user found. Run DatabaseSeeder first.');

            return;
        }

        $children = Child::withTrashed()->get();

        if ($children->isEmpty()) {
            $this->command->warn('No children found. Run ChildSeeder first.');

            return;
        }

        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        HealthLog::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1');

        $total = 0;

        foreach ($children as $child) {
            $logsPerChild = 25;
            $monthsOld = max(1, $child->age ?? 12);

            for ($i = 0; $i < $logsPerChild; $i++) {
                $progress = $logsPerChild > 1 ? $i / ($logsPerChild - 1) : 1;

                $monthsAgo = ($logsPerChild - 1 - $i) * max(1, (int) round($monthsOld / $logsPerChild));

                $baseWeight = $child->weight ?? 10;
                $baseHeight = $child->height ?? 80;

                $weight = round($baseWeight * (0.6 + 0.4 * $progress) + (rand(-5, 5) / 10), 1);
                $height = round($baseHeight * (0.8 + 0.2 * $progress) + (rand(-10, 10) / 10), 1);

                $weight = max(0.5, $weight);
                $height = max(10, $height);

                $evaluation = GrowthHelper::evaluateChild(
                    $child->sex,
                    $child->birthdate,
                    $weight,
                    $height
                );

                $createdAt = Carbon::now()->subDays(max(0, $monthsAgo * 30 + rand(-3, 3)));

                HealthLog::create([
                    'child_id' => $child->id,
                    'user_id' => $admin->id,
                    'weight' => $weight,
                    'height' => $height,
                    'bmi' => $evaluation['bmi'],
                    'status_wfa' => $evaluation['status_wfa'],
                    'status_lfa' => $evaluation['status_lfa'],
                    'status_wfl_wfh' => $evaluation['status_wfl_wfh'],
                    'nutrition_status' => $evaluation['overall'],
                    'vitamin_a' => rand(0, 1),
                    'deworming' => rand(0, 1),
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                ]);

                $total++;
            }
        }

        $this->command->info("Created {$total} health log records across {$children->count()} children.");
    }
}
