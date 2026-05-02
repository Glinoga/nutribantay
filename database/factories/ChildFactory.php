<?php

namespace Database\Factories;

use App\Models\Child;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

/**
 * @extends Factory<Child>
 */
class ChildFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $faker = \Faker\Factory::create('en_PH');

        return [
            'first_name' => $faker->firstName(),
            'middle_initial' => strtoupper($faker->randomLetter()),
            'last_name' => $faker->lastName(),
            'sex' => $faker->randomElement(['Male', 'Female']),
            'weight' => $faker->randomFloat(2, 2, 30),
            'height' => $faker->randomFloat(2, 50, 120),
            'birthdate' => Carbon::now()->subMonths($faker->numberBetween(1, 60))->format('Y-m-d'),
            'barangay' => $faker->numberBetween(1, 10),
            'address' => $faker->address(),
            'contact_number' => '0917'.$faker->numerify('######'),
            'created_by' => 1,
            'updated_by' => 1,
        ];
    }
}
