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

        // Create admin account
        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name'  => 'Super Admin',
                'password' => Hash::make('password123'),
            ]
        );
        $admin->syncRoles(['Admin']);   // use syncRoles for reliability

        // Create healthworker account
        $healthworker = User::firstOrCreate(
            ['email' => 'health@example.com'],
            [
                'name' => 'Health Worker',
                'password' => Hash::make('password123'),
            ]
        );
        $healthworker->syncRoles(['Healthworker']);
    }
}
