<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Run PermissionSeeder first
        $this->call(PermissionSeeder::class);

        $this->call(GrowthStandardSeeder::class);

        $this->call(DashboardTestSeeder::class);

        $this->call(CategorySeeder::class);

        // Create admin account
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

        // Create healthworker account
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
    }
}
