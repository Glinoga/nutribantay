<?php

namespace App\Helpers;

use Carbon\Carbon;

class GrowthHelper
{
    public static function calculateBMI($weight, $height)
    {
        if (!$weight || !$height || $height <= 0) {
            return null;
        }

        $heightInMeters = $height / 100;
        return round($weight / ($heightInMeters * $heightInMeters), 2);
    }

    public static function calculateZScores($sex, $birthdate, $weight, $height)
    {
        if (!$birthdate || !$weight || !$height) {
            return [
                'wfa' => null,
                'lfa' => null,
                'wfh' => null,
                'status' => 'Incomplete data',
            ];
        }

        $ageMonths = Carbon::parse($birthdate)->diffInMonths(Carbon::now());
        $bmi = self::calculateBMI($weight, $height);
        $status = 'Normal';

        if ($bmi < 14) {
            $status = 'Underweight';
        } elseif ($bmi >= 14 && $bmi < 18) {
            $status = 'Normal';
        } elseif ($bmi >= 18) {
            $status = 'Overweight';
        }

        return [
            'wfa' => round(($bmi - 15) / 2, 2),
            'lfa' => round(($bmi - 15) / 3, 2),
            'wfh' => round(($bmi - 15) / 2.5, 2),
            'status' => $status,
        ];
    }
}
