<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Announcement;

class AnnouncementSeeder extends Seeder
{
    public function run(): void
    {
        Announcement::create([
            'title'   => 'Welcome to NutriBantay!',
            'content' => 'This is your first announcement. Stay tuned for more updates.',
            'user_id' => 1, // make sure user with ID 1 exists (Admin/Healthworker)
        ]);

        Announcement::create([
            'title'   => 'Health Checkup Reminder',
            'content' => 'Free health checkups will be available at Barangay 101 Health Center this weekend.',
            'user_id' => 1,
        ]);

        Announcement::create([
            'title'   => 'Nutrition Tips',
            'content' => 'Remember to eat a balanced diet rich in fruits and vegetables for better health.',
            'user_id' => 1,
        ]);
    }
}
