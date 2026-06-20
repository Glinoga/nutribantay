<?php

namespace Database\Seeders;

use App\Models\Child;
use App\Models\User;
use Carbon\Carbon;
use Faker\Factory;
use Illuminate\Database\Seeder;

class ChildSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'nutribantay@gmail.com')->first();

        if (! $admin) {
            $this->command->warn('No admin user found. Run DatabaseSeeder first.');

            return;
        }

        $barangay = $admin->barangay ?? '176B';

        $faker = Factory::create('en_PH');

        $children = [
            // ── Normal children (under 60 months) ──────────────────────────
            [
                'first_name' => 'Baby',
                'middle_initial' => 'M',
                'last_name' => 'Santos',
                'birthdate' => Carbon::now()->subMonths(2),
                'sex' => 'Male',
                'weight' => 5.5,
                'height' => 55.0,
                'nutrition_status' => 'Normal',
            ],
            [
                'first_name' => 'Liza',
                'middle_initial' => 'D',
                'last_name' => 'Cruz',
                'birthdate' => Carbon::now()->subMonths(12),
                'sex' => 'Female',
                'weight' => 8.9,
                'height' => 74.0,
                'nutrition_status' => 'Normal',
            ],
            [
                'first_name' => 'Jose',
                'middle_initial' => 'R',
                'last_name' => 'Reyes',
                'birthdate' => Carbon::now()->subMonths(24),
                'sex' => 'Male',
                'weight' => 11.2,
                'height' => 86.0,
                'nutrition_status' => 'Underweight',
            ],
            [
                'first_name' => 'Elena',
                'middle_initial' => 'V',
                'last_name' => 'Gonzales',
                'birthdate' => Carbon::now()->subMonths(36),
                'sex' => 'Female',
                'weight' => 14.0,
                'height' => 95.0,
                'nutrition_status' => 'Overweight',
            ],
            [
                'first_name' => 'Ramon',
                'middle_initial' => 'L',
                'last_name' => 'Fernandez',
                'birthdate' => Carbon::now()->subMonths(48),
                'sex' => 'Male',
                'weight' => 16.5,
                'height' => 105.0,
                'nutrition_status' => 'Normal',
            ],
            [
                'first_name' => 'Nena',
                'middle_initial' => 'A',
                'last_name' => 'Villanueva',
                'birthdate' => Carbon::now()->subMonths(55),
                'sex' => 'Female',
                'weight' => 17.8,
                'height' => 110.0,
                'nutrition_status' => 'Stunted',
            ],
            // ── Boundary: 59 months (still in main listing) ───────────────
            [
                'first_name' => 'Tomas',
                'middle_initial' => 'B',
                'last_name' => 'Magsaysay',
                'birthdate' => Carbon::now()->subMonths(59),
                'sex' => 'Male',
                'weight' => 18.2,
                'height' => 112.0,
                'nutrition_status' => 'Normal',
            ],

            // ── Overaged children (60+ months) ─────────────────────────────
            [
                'first_name' => 'Andres',
                'middle_initial' => 'C',
                'last_name' => 'Bonifacio',
                'birthdate' => Carbon::now()->subMonths(60),
                'sex' => 'Male',
                'weight' => 19.0,
                'height' => 115.0,
                'nutrition_status' => 'Normal',
            ],
            [
                'first_name' => 'Gabriela',
                'middle_initial' => 'S',
                'last_name' => 'Silang',
                'birthdate' => Carbon::now()->subMonths(61),
                'sex' => 'Female',
                'weight' => 19.4,
                'height' => 116.0,
                'nutrition_status' => 'Normal',
            ],
            [
                'first_name' => 'Jose',
                'middle_initial' => 'P',
                'last_name' => 'Rizal',
                'birthdate' => Carbon::now()->subMonths(66),
                'sex' => 'Male',
                'weight' => 20.1,
                'height' => 118.0,
                'nutrition_status' => 'Underweight',
            ],
            [
                'first_name' => 'Melchora',
                'middle_initial' => 'T',
                'last_name' => 'Aquino',
                'birthdate' => Carbon::now()->subMonths(72),
                'sex' => 'Female',
                'weight' => 22.5,
                'height' => 122.0,
                'nutrition_status' => 'Overweight',
            ],
            [
                'first_name' => 'Antonio',
                'middle_initial' => 'N',
                'last_name' => 'Luna',
                'birthdate' => Carbon::now()->subMonths(84),
                'sex' => 'Male',
                'weight' => 25.0,
                'height' => 128.0,
                'nutrition_status' => 'Normal',
            ],
            [
                'first_name' => 'Apolinario',
                'middle_initial' => 'M',
                'last_name' => 'Mabini',
                'birthdate' => Carbon::now()->subMonths(120),
                'sex' => 'Male',
                'weight' => 30.0,
                'height' => 140.0,
                'nutrition_status' => 'Stunted',
            ],

            // ── Soft-deleted children (for Archived tab testing) ───────────
            [
                'first_name' => 'Deleted',
                'middle_initial' => 'X',
                'last_name' => 'Child',
                'birthdate' => Carbon::now()->subMonths(30),
                'sex' => 'Female',
                'weight' => 13.0,
                'height' => 92.0,
                'nutrition_status' => 'Normal',
                'deleted' => true,
            ],
            [
                'first_name' => 'Overage',
                'middle_initial' => 'Y',
                'last_name' => 'Archived',
                'birthdate' => Carbon::now()->subMonths(70),
                'sex' => 'Male',
                'weight' => 21.0,
                'height' => 120.0,
                'nutrition_status' => 'Normal',
                'deleted' => true,
            ],
        ];

        $created = 0;

        foreach ($children as $childData) {
            $deleted = $childData['deleted'] ?? false;
            unset($childData['deleted']);

            $existing = Child::withTrashed()
                ->where('first_name', $childData['first_name'])
                ->where('last_name', $childData['last_name'])
                ->whereDate('birthdate', $childData['birthdate'])
                ->first();

            if ($existing) {
                continue;
            }

            $childData['barangay'] = $barangay;
            $childData['address'] = $faker->address();
            $childData['contact_number'] = '0917'.$faker->numerify('######');
            $childData['created_by'] = $admin->id;
            $childData['updated_by'] = $admin->id;

            $child = Child::create($childData);

            if ($deleted) {
                $child->delete();
            }

            $created++;
        }

        $this->command->info("Created {$created} children.");
    }
}
