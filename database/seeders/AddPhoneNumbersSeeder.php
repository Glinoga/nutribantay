<?php

namespace Database\Seeders;

use App\Models\Child;
use Illuminate\Database\Seeder;

class AddPhoneNumbersSeeder extends Seeder
{
    public function run(): void
    {
        if (!class_exists(\Faker\Factory::class)) {
            $this->command->warn('Skipping AddPhoneNumbersSeeder: fakerphp/faker not installed.');
            return;
        }

        $children = Child::whereNull('contact_number')
            ->orWhere('contact_number', '')
            ->get();

        $faker = \Faker\Factory::create('en_PH');

        $count = 0;
        foreach ($children as $child) {
            $prefix = $faker->randomElement(['917', '918', '919', '920', '921']);
            $number = '09'.$prefix.$faker->numerify('######');

            $child->update(['contact_number' => $number]);
            $count++;
        }

        $this->command->info("Updated {$count} children with phone numbers.");
    }
}
