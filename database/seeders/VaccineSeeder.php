<?php

namespace Database\Seeders;

use App\Models\Vaccine;
use Illuminate\Database\Seeder;

class VaccineSeeder extends Seeder
{
    public function run(): void
    {
        $vaccines = [
            ['name' => 'BCG', 'description' => 'Bacillus Calmette-Guérin (Tuberculosis)'],
            ['name' => 'Hepatitis B', 'description' => 'Hepatitis B Vaccine'],
            ['name' => 'Pentavalent', 'description' => 'DPT-HepB-Hib (Diphtheria, Pertussis, Tetanus, Hepatitis B, Hib)'],
            ['name' => 'OPV', 'description' => 'Oral Polio Vaccine'],
            ['name' => 'IPV', 'description' => 'Inactivated Polio Vaccine'],
            ['name' => 'Measles', 'description' => 'Measles-Containing Vaccine'],
            ['name' => 'MR', 'description' => 'Measles, Rubella'],
            ['name' => 'MMR', 'description' => 'Measles, Mumps, Rubella'],
        ];

        foreach ($vaccines as $vaccine) {
            Vaccine::create($vaccine);
        }
    }
}
