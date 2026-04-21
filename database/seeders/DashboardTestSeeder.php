<?php

namespace Database\Seeders;

use App\Models\Child;
use App\Models\HealthLog;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class DashboardTestSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'admin@example.com')->first();
        
        if (!$admin) {
            $this->command->warn('No admin user found. Run seeder first: php artisan db:seed');
            return;
        }

        $barangay = $admin->barangay ?? 'Bagong Silang';

        // Create test children
        $children = [
            [
                'first_name' => 'Juan',
                'middle_initial' => 'C',
                'last_name' => 'Dela Cruz',
                'birthdate' => Carbon::now()->subMonths(4),
                'sex' => 'Male',
                'barangay' => $barangay,
                'created_by' => $admin->id,
            ],
            [
                'first_name' => 'Maria',
                'middle_initial' => 'S',
                'last_name' => 'Garcia',
                'birthdate' => Carbon::now()->subMonths(8),
                'sex' => 'Female',
                'barangay' => $barangay,
                'created_by' => $admin->id,
            ],
            [
                'first_name' => 'Pedro',
                'middle_initial' => 'R',
                'last_name' => 'Mendoza',
                'birthdate' => Carbon::now()->subMonths(18),
                'sex' => 'Male',
                'barangay' => $barangay,
                'created_by' => $admin->id,
            ],
            [
                'first_name' => 'Ana',
                'middle_initial' => 'B',
                'last_name' => 'Torres',
                'birthdate' => Carbon::now()->subMonths(30),
                'sex' => 'Female',
                'barangay' => $barangay,
                'created_by' => $admin->id,
            ],
            [
                'first_name' => 'Lito',
                'middle_initial' => 'A',
                'last_name' => 'Navarro',
                'birthdate' => Carbon::now()->subMonths(48),
                'sex' => 'Male',
                'barangay' => $barangay,
                'created_by' => $admin->id,
            ],
        ];

        foreach ($children as $childData) {
            $child = Child::create($childData);

            // Create healthlogs for different periods
            $periods = [
                ['days_ago' => 0, 'period' => 'daily'],
                ['days_ago' => 3, 'period' => 'daily'],
                ['days_ago' => 5, 'period' => 'weekly'],
                ['days_ago' => 15, 'period' => 'monthly'],
                ['days_ago' => 60, 'period' => 'monthly'],
                ['days_ago' => 120, 'period' => 'yearly'],
            ];

            foreach ($periods as $period) {
                HealthLog::create([
                    'child_id' => $child->id,
                    'user_id' => $admin->id,
                    'weight' => rand(5, 15) + (rand(0, 100) / 100),
                    'height' => rand(50, 90) + (rand(0, 100) / 100),
                    'bmi' => rand(14, 22),
                    'status_wfa' => 'Normal',
                    'status_lfa' => 'Normal',
                    'status_wfl_wfh' => 'Normal',
                    'nutrition_status' => ['Normal', 'Underweight', 'Overweight', 'Stunted'][array_rand(['Normal', 'Underweight', 'Overweight', 'Stunted'])],
                    'vitamin_a' => rand(0, 1),
                    'deworming' => rand(0, 1),
                    'created_at' => Carbon::now()->subDays($period['days_ago']),
                ]);
            }
        }

        $this->command->info('Created ' . count($children) . ' children with healthlogs.');
    }
}