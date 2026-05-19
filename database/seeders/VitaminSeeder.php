<?php

namespace Database\Seeders;

use App\Models\Vitamin;
use Illuminate\Database\Seeder;

class VitaminSeeder extends Seeder
{
    public function run(): void
    {
        $vitamins = [
            ['name' => 'Vitamin A', 'description' => 'Bi-annual mega-dose supplementation for children 6-59 months old'],
            ['name' => 'Iron', 'description' => 'Daily/weekly iron supplementation for prevention of anemia'],
            ['name' => 'MNP', 'description' => 'Multiple Micronutrient Powders for children 6-23 months old'],
        ];

        foreach ($vitamins as $vitamin) {
            Vitamin::firstOrCreate(
                ['name' => $vitamin['name']],
                ['description' => $vitamin['description']]
            );
        }
    }
}
