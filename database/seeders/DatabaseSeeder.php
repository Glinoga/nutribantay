<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(PermissionSeeder::class);

        // Create default accounts first so other seeders can reference them
        $admin = User::firstOrCreate(
            ['email' => 'nutribantay@gmail.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password123'),
                'barangay' => '176B',
                'status' => 'approved',
            ]
        );
        $admin->syncRoles(['Admin']);

        $healthworker = User::firstOrCreate(
            ['email' => 'health@example.com'],
            [
                'name' => 'Health Worker',
                'password' => Hash::make('password123'),
                'barangay' => '176B',
                'status' => 'approved',
            ]
        );
        $healthworker->syncRoles(['Healthworker']);

        $this->call(GrowthStandardSeeder::class);
        $this->call(DashboardTestSeeder::class);
        $this->call(CategorySeeder::class);
        $this->call(AddPhoneNumbersSeeder::class);
    }
}
