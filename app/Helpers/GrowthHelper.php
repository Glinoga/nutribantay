<?php

namespace App\Helpers;

use Carbon\Carbon;
use App\Models\GrowthStandard;

class GrowthHelper
{
    /**
     * BMI calculation
     */
    public static function calculateBMI($weight, $height)
    {
        if (!$weight || !$height || $height <= 0) {
            return null;
        }

        return round($weight / pow($height / 100, 2), 2);
    }

    /**
     * Convert birthdate to age in months
     */
    public static function calculateAgeInMonths($birthdate)
    {
        if (!$birthdate) {
            return null;
        }
        

        // FORCE INTEGER so DB lookup always matches
        return intval(Carbon::parse($birthdate)->diffInMonths(Carbon::now()));
    }

    /**
     * Main evaluation function
     */
    public static function evaluateChild($sex, $birthdate, $weight, $height)
    {
        $ageMonths = self::calculateAgeInMonths($birthdate);
        $bmi = self::calculateBMI($weight, $height);

        if ($ageMonths === null) {
            return [
                'age_months' => null,
                'bmi' => $bmi,
                'status_wfa' => null,
                'status_lfa' => null,
                'status_wfl_wfh' => null,
                'overall' => null,
            ];
        }

        $gender = strtolower($sex) === 'male' ? 'boy' : 'girl';

        // -------------------------------------------------------
        // 1. WEIGHT-FOR-AGE (WFA)
        // -------------------------------------------------------
        $wfa = GrowthStandard::where('gender', $gender)
            ->where('type', 'weight_for_age')
            ->where('measure_value', $ageMonths)
            ->first();

        $statusWfa = $wfa ? self::classify($weight, $wfa, 'wfa') : null;

        // -------------------------------------------------------
        // 2. LENGTH/HEIGHT-FOR-AGE (LFA)
        // -------------------------------------------------------
        $lfa = GrowthStandard::where('gender', $gender)
            ->where('type', 'height_length_for_age')
            ->where('measure_value', $ageMonths)
            ->first();

        $statusLfa = $lfa ? self::classify($height, $lfa, 'lfa') : null;

        // -------------------------------------------------------
        // 3. WEIGHT-FOR-LENGTH or WEIGHT-FOR-HEIGHT
        // -------------------------------------------------------
        $type = $ageMonths < 24 ? 'weight_for_length' : 'weight_for_height';

        // Round height to nearest .5 and force DB-safe formatting
        $lookupHeight = number_format(round($height * 2) / 2, 1, '.', '');

        $wfl = GrowthStandard::where('gender', $gender)
            ->where('type', $type)
            ->where('measure_value', $lookupHeight) // matches DB now
            ->first();

        $statusWflWfh = $wfl ? self::classify($weight, $wfl, 'wfl') : null;

        // -------------------------------------------------------
        // 4. OVERALL STATUS
        // -------------------------------------------------------
        $overall = self::computeOverallStatus($statusWfa, $statusLfa, $statusWflWfh);

        return [
            'age_months' => $ageMonths,
            'bmi' => $bmi,
            'status_wfa' => $statusWfa,
            'status_lfa' => $statusLfa,
            'status_wfl_wfh' => $statusWflWfh,
            'overall' => $overall,
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
    /**
     * Classification based on WHO SD thresholds
     */
    private static function classify($value, GrowthStandard $standard, $mode)
    {
        $v = floatval($value);

        if ($v < $standard->sd_neg_3) {
            return [
                'lfa' => 'Severely Stunted',
                'wfa' => 'Severely Underweight',
                'wfl' => 'Severely Wasted',
            ][$mode];
        }

        if ($v < $standard->sd_neg_2) {
            return [
                'lfa' => 'Stunted',
                'wfa' => 'Underweight',
                'wfl' => 'Wasted',
            ][$mode];
        }

        if ($v <= $standard->sd_plus_2) {
            return 'Normal';
        }

        if ($standard->sd_plus_3 === null || $v <= $standard->sd_plus_3) {
            return [
                'lfa' => 'Tall',
                'wfa' => 'Overweight',
                'wfl' => 'Overweight',
            ][$mode];
        }

        // Only weight-for-height has obesity
        return $mode === 'lfa' ? 'Tall' : 'Obese';
    }

    /**
     * Compute final combined nutrition status
     */
    private static function computeOverallStatus($wfa, $lfa, $wfl)
    {
        $list = [$wfa, $lfa, $wfl];

        if (collect($list)->contains(fn($s) => $s && str_contains($s, 'Severely'))) {
            return 'Severe Malnutrition';
        }

        if (collect($list)->contains(fn($s) => in_array($s, ['Underweight', 'Stunted', 'Wasted']))) {
            return 'Moderate Malnutrition';
        }

        if (collect($list)->contains(fn($s) => in_array($s, ['Overweight', 'Obese']))) {
            return 'Overweight/Obese';
        }

        if (collect($list)->filter()->every(fn($s) => in_array($s, ['Normal', 'Tall']))) {
            return 'Normal';
        }

        return null;
    }
}
