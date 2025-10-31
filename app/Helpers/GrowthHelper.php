<?php

namespace App\Helpers;

use Carbon\Carbon;

class GrowthHelper
{
    public static function calculateBMI($weight, $height)
    {
        if (empty($weight) || empty($height) || $height <= 0) {
            return null;
        }

        $heightInMeters = $height / 100;
        return round($weight / pow($heightInMeters, 2), 2);
    }

    public static function calculateZScores($sex, $birthdate, $weight, $height)
    {
        if (empty($birthdate) || empty($weight) || empty($height)) {
            return [
                'wfa' => null,
                'lfa' => null,
                'wfh' => null,
                'status' => 'Incomplete data',
            ];
        }
        

        $ageMonths = Carbon::parse($birthdate)->diffInMonths(Carbon::now());
        $bmi = self::calculateBMI($weight, $height);

        if (is_null($bmi)) {
            return [
                'wfa' => null,
                'lfa' => null,
                'wfh' => null,
                'status' => 'Invalid data',
            ];
        }

        // Optional: separate thresholds for sex
        $thresholds = ($sex === 'Female')
            ? ['under' => 13.5, 'normal' => 17.5]
            : ['under' => 14.0, 'normal' => 18.0];

        $status = 'Normal';
        if ($bmi < $thresholds['under']) {
            $status = 'Underweight';
        } elseif ($bmi >= $thresholds['normal']) {
            $status = 'Overweight';
        }

        return [
            'wfa' => round(($bmi - 15) / 2, 2),
            'lfa' => round(($bmi - 15) / 3, 2),
            'wfh' => round(($bmi - 15) / 2.5, 2),
            'status' => $status,
        ];
    }

    public static function generateRecommendation($nutritionStatus, $bmi, $weight, $height)
    {
        // Basic sample logic — you can expand later
        if (!$nutritionStatus) {
            return "No nutrition status data available for this child.";
        }

        switch (strtolower($nutritionStatus)) {
            case 'underweight':
            case 'severely underweight':
                return "The child is underweight. 
- Provide energy-dense foods such as rice, eggs, and vegetables.
- Encourage small, frequent meals.
- Monitor progress every 2 weeks.";

            case 'overweight':
            case 'obese':
                return "The child is overweight. 
- Limit sugary and fatty foods.
- Increase fruits, vegetables, and physical activity.
- Reassess BMI monthly.";

            case 'normal':
                return "The child is within the normal range. 
- Continue a balanced diet rich in nutrients.
- Maintain regular health checks.";

            default:
                return "Nutrition status is unclear. Please verify data and consult a health professional.";
        }
    }
}
