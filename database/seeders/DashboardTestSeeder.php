<?php

namespace Database\Seeders;

use App\Models\Child;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class DashboardTestSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'nutribantay@gmail.com')->first();

        if (! $admin) {
            $this->command->warn('No admin user found.');

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
            Child::create($childData);
        }

        $this->command->info('Created '.count($children).' children.');
    }
}
