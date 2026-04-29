<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run()
    {
        $categories = [
            ['name' => 'Workshop', 'color' => 'blue'],
            ['name' => 'Education', 'color' => 'red'],
            ['name' => 'Programs', 'color' => 'orange'],
            ['name' => 'Events', 'color' => 'yellow'],
            ['name' => 'News', 'color' => 'success'],
            ['name' => 'Updates', 'color' => 'info'],
        ];
        
        foreach ($categories as $category) {
            Category::create([
                'name' => $category['name'],
                'slug' => Str::slug($category['name']),
                'color' => $category['color'],
            ]);
        }
    }
}