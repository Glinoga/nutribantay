<?php

namespace Database\Seeders;

use App\Models\Child;
use Faker\Factory as FakerFactory;

class AddPhoneNumbersSeeder extends \Illuminate\Database\Seeder
{
    public function run(): void
    {
        $children = Child::whereNull('contact_number')
            ->orWhere('contact_number', '')
            ->get();

        $faker = FakerFactory::create('en_PH');

        $count = 0;
        foreach ($children as $child) {
            $prefix = $faker->randomElement(['917', '918', '919', '920', '921']);
            $number = '09' . $prefix . $faker->numerify('######');

            $child->update(['contact_number' => $number]);
            $count++;
        }

        $this->command->info("Updated {$count} children with phone numbers.");
    }
}
