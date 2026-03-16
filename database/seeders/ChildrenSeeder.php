<?php

namespace Database\Seeders;

use App\Models\Child;
use Illuminate\Database\Seeder;

class ChildrenSeeder extends Seeder
{
    public function run(): void
    {
        $children = [
            // --- 2023 records ---
            // vaccinated = true/false mixed in
            ['name' => 'Juan Dela Cruz',       'sex' => 'Male',   'age' => 3,  'weight' => 11.0, 'height' => 88.0,  'barangay' => 'Barangay Uno',    'vaccinated' => true,  'created_at' => '2023-02-10'],
            ['name' => 'Maria Santos',          'sex' => 'Female', 'age' => 4,  'weight' => 12.5, 'height' => 95.0,  'barangay' => 'Barangay Uno',    'vaccinated' => true,  'created_at' => '2023-03-15'],
            ['name' => 'Pedro Reyes',           'sex' => 'Male',   'age' => 5,  'weight' => 16.0, 'height' => 105.0, 'barangay' => 'Barangay Dos',    'vaccinated' => false, 'created_at' => '2023-04-20'],
            ['name' => 'Ana Garcia',            'sex' => 'Female', 'age' => 2,  'weight' => 9.0,  'height' => 80.0,  'barangay' => 'Barangay Dos',    'vaccinated' => true,  'created_at' => '2023-05-11'],
            ['name' => 'Luis Torres',           'sex' => 'Male',   'age' => 6,  'weight' => 14.0, 'height' => 110.0, 'barangay' => 'Barangay Tres',   'vaccinated' => true,  'created_at' => '2023-06-01'],
            ['name' => 'Rosa Mendoza',          'sex' => 'Female', 'age' => 7,  'weight' => 17.5, 'height' => 118.0, 'barangay' => 'Barangay Tres',   'vaccinated' => false, 'created_at' => '2023-06-22'],
            ['name' => 'Carlo Bautista',        'sex' => 'Male',   'age' => 4,  'weight' => 13.0, 'height' => 97.0,  'barangay' => 'Barangay Quatro', 'vaccinated' => true,  'created_at' => '2023-07-05'],
            ['name' => 'Liza Ramos',            'sex' => 'Female', 'age' => 5,  'weight' => 11.5, 'height' => 100.0, 'barangay' => 'Barangay Quatro', 'vaccinated' => false, 'created_at' => '2023-08-14'],
            ['name' => 'Jose Villanueva',       'sex' => 'Male',   'age' => 3,  'weight' => 10.0, 'height' => 85.0,  'barangay' => 'Barangay Cinco',  'vaccinated' => true,  'created_at' => '2023-09-09'],
            ['name' => 'Elena Cruz',            'sex' => 'Female', 'age' => 6,  'weight' => 18.0, 'height' => 112.0, 'barangay' => 'Barangay Cinco',  'vaccinated' => true,  'created_at' => '2023-10-17'],
            ['name' => 'Marco Fernandez',       'sex' => 'Male',   'age' => 8,  'weight' => 20.0, 'height' => 124.0, 'barangay' => 'Barangay Seis',   'vaccinated' => false, 'created_at' => '2023-11-03'],
            ['name' => 'Sofia Aquino',          'sex' => 'Female', 'age' => 2,  'weight' => 8.5,  'height' => 78.0,  'barangay' => 'Barangay Seis',   'vaccinated' => true,  'created_at' => '2023-11-28'],
            ['name' => 'Ramon Pascual',         'sex' => 'Male',   'age' => 9,  'weight' => 19.0, 'height' => 130.0, 'barangay' => 'Barangay Uno',    'vaccinated' => true,  'created_at' => '2023-12-05'],
            ['name' => 'Carla Navarro',         'sex' => 'Female', 'age' => 10, 'weight' => 100.0, 'height' => 138.0, 'barangay' => 'Barangay Dos',    'vaccinated' => false, 'created_at' => '2023-12-19'],
            ['name' => 'Andres Magno',          'sex' => 'Male',   'age' => 1,  'weight' => 7.0,  'height' => 70.0,  'barangay' => 'Barangay Tres',   'vaccinated' => true,  'created_at' => '2023-01-30'],

            // --- 2024 records ---
            ['name' => 'Bianca Lopez',          'sex' => 'Female', 'age' => 4,  'weight' => 14.0, 'height' => 98.0,  'barangay' => 'Barangay Uno',    'vaccinated' => true,  'created_at' => '2024-01-08'],
            ['name' => 'Kevin Gomez',           'sex' => 'Male',   'age' => 5,  'weight' => 13.0, 'height' => 103.0, 'barangay' => 'Barangay Uno',    'vaccinated' => true,  'created_at' => '2024-01-22'],
            ['name' => 'Patricia Delos Reyes',  'sex' => 'Female', 'age' => 3,  'weight' => 10.5, 'height' => 87.0,  'barangay' => 'Barangay Dos',    'vaccinated' => false, 'created_at' => '2024-02-14'],
            ['name' => 'Nathan Castillo',       'sex' => 'Male',   'age' => 7,  'weight' => 16.5, 'height' => 117.0, 'barangay' => 'Barangay Dos',    'vaccinated' => true,  'created_at' => '2024-02-28'],
            ['name' => 'Jasmine Flores',        'sex' => 'Female', 'age' => 6,  'weight' => 150.0, 'height' => 111.0, 'barangay' => 'Barangay Tres',   'vaccinated' => true,  'created_at' => '2024-03-10'],
            ['name' => 'Diego Morales',         'sex' => 'Male',   'age' => 2,  'weight' => 9.5,  'height' => 82.0,  'barangay' => 'Barangay Tres',   'vaccinated' => false, 'created_at' => '2024-03-25'],
            ['name' => 'Camille Soriano',       'sex' => 'Female', 'age' => 8,  'weight' => 143.0, 'height' => 126.0, 'barangay' => 'Barangay Quatro', 'vaccinated' => true,  'created_at' => '2024-04-05'],
            ['name' => 'Emilio Padilla',        'sex' => 'Male',   'age' => 4,  'weight' => 12.0, 'height' => 94.0,  'barangay' => 'Barangay Quatro', 'vaccinated' => true,  'created_at' => '2024-04-18'],
            ['name' => 'Hazel Miranda',         'sex' => 'Female', 'age' => 9,  'weight' => 23.0, 'height' => 132.0, 'barangay' => 'Barangay Cinco',  'vaccinated' => true, 'created_at' => '2024-05-07'],
            ['name' => 'Felix Aguilar',         'sex' => 'Male',   'age' => 3,  'weight' => 11.0, 'height' => 86.0,  'barangay' => 'Barangay Cinco',  'vaccinated' => true,  'created_at' => '2024-05-21'],
            ['name' => 'Trisha Domingo',        'sex' => 'Female', 'age' => 5,  'weight' => 14.5, 'height' => 104.0, 'barangay' => 'Barangay Seis',   'vaccinated' => true,  'created_at' => '2024-06-03'],
            ['name' => 'Ronnie dela Vega',      'sex' => 'Male',   'age' => 10, 'weight' => 24.0, 'height' => 140.0, 'barangay' => 'Barangay Seis',   'vaccinated' => true,  'created_at' => '2024-06-17'],
            ['name' => 'Sheila Macaraeg',       'sex' => 'Female', 'age' => 1,  'weight' => 7.5,  'height' => 72.0,  'barangay' => 'Barangay Uno',    'vaccinated' => false, 'created_at' => '2024-07-09'],
            ['name' => 'Alvin Peralta',         'sex' => 'Male',   'age' => 6,  'weight' => 13.5, 'height' => 109.0, 'barangay' => 'Barangay Dos',    'vaccinated' => true,  'created_at' => '2024-07-23'],
            ['name' => 'Gina Evangelista',      'sex' => 'Female', 'age' => 7,  'weight' => 15.5, 'height' => 116.0, 'barangay' => 'Barangay Tres',   'vaccinated' => true,  'created_at' => '2024-08-12'],
            ['name' => 'Bernard Ocampo',        'sex' => 'Male',   'age' => 2,  'weight' => 8.0,  'height' => 79.0,  'barangay' => 'Barangay Quatro', 'vaccinated' => false, 'created_at' => '2024-08-30'],
            ['name' => 'Vanessa Tolentino',     'sex' => 'Female', 'age' => 4,  'weight' => 11.5, 'height' => 96.0,  'barangay' => 'Barangay Cinco',  'vaccinated' => true,  'created_at' => '2024-09-14'],
            ['name' => 'Jericho Valdez',        'sex' => 'Male',   'age' => 8,  'weight' => 19.5, 'height' => 125.0, 'barangay' => 'Barangay Seis',   'vaccinated' => true,  'created_at' => '2024-09-29'],
            ['name' => 'Alma Ricafort',         'sex' => 'Female', 'age' => 3,  'weight' => 10.0, 'height' => 84.0,  'barangay' => 'Barangay Uno',    'vaccinated' => false, 'created_at' => '2024-10-11'],
            ['name' => 'Dennis Hipolito',       'sex' => 'Male',   'age' => 5,  'weight' => 15.0, 'height' => 106.0, 'barangay' => 'Barangay Dos',    'vaccinated' => true,  'created_at' => '2024-11-02'],
            ['name' => 'Rowena Buenaventura',   'sex' => 'Female', 'age' => 6,  'weight' => 16.0, 'height' => 113.0, 'barangay' => 'Barangay Tres',   'vaccinated' => true,  'created_at' => '2024-11-20'],
            ['name' => 'Gilbert Manalo',        'sex' => 'Male',   'age' => 9,  'weight' => 18.5, 'height' => 131.0, 'barangay' => 'Barangay Quatro', 'vaccinated' => false, 'created_at' => '2024-12-08'],
            ['name' => 'Cristina Villarin',     'sex' => 'Female', 'age' => 10, 'weight' => 21.5, 'height' => 139.0, 'barangay' => 'Barangay Cinco',  'vaccinated' => true,  'created_at' => '2024-12-22'],
        ];

        foreach ($children as $child) {
            Child::create([
                'name'        => $child['name'],
                'sex'         => $child['sex'],
                'age'         => $child['age'],
                'weight'      => $child['weight'],
                'height'      => $child['height'],
                'barangay'    => $child['barangay'],
                'vaccinated'  => $child['vaccinated'],
                'created_by'  => 1,
                'created_at'  => $child['created_at'],
                'updated_at'  => $child['created_at'],
            ]);
        }

        $this->command->info('✅ ' . count($children) . ' test children seeded successfully.');
    }
}