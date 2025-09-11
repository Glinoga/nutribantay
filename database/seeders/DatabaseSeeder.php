<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Run the PermissionSeeder first
        $this->call(PermissionSeeder::class);

        // Create admin account
        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password123'),
            ]
        );
        $admin->assignRole('Admin');

        // Create healthworker account
        $healthworker = User::firstOrCreate(
            ['email' => 'health@example.com'],
            [
                'name' => 'Health Worker',
                'password' => Hash::make('password123'),
            ]
        );
        $healthworker->assignRole('Healthworker');
    }
}
