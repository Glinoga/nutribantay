<?php

namespace App\Helpers;

class AIRecommender
{
    public static function getRecommendation($status, $sex, $ageInMonths, $bmi)
    {
        if (empty($status) || empty($sex) || empty($ageInMonths) || empty($bmi)) {
            return "Insufficient data to generate recommendation.";
        }

        // Age in months for precise advice
        $ageMonths = floor($ageInMonths);
        $ageYears = floor($ageMonths / 12);

        $advice = "";

        switch ($status) {
            case 'Underweight':
                $advice .= "Your child appears underweight for their age. ";
                $advice .= self::dietAdvice($sex, $ageMonths, $bmi);
                $advice .= " Ensure regular meals and monitor growth weekly. ";
                break;

            case 'Overweight':
                $advice .= "Your child appears overweight for their age. ";
                $advice .= self::dietAdvice($sex, $ageMonths, $bmi);
                $advice .= " Encourage physical activity daily and limit sugary foods. ";
                break;

            default:
                $advice .= "Your child’s growth is within a healthy range. ";
                $advice .= self::dietAdvice($sex, $ageMonths, $bmi);
                $advice .= " Continue balanced meals and regular checkups.";
        }

        return $advice;
    }

    private static function dietAdvice($sex, $ageMonths, $bmi)
    {
        $tips = "";

        // Example: age-based suggestions
        if ($ageMonths < 24) {
            $tips .= "Focus on breastfeeding or formula plus soft solids appropriate for toddlers. ";
        } elseif ($ageMonths < 60) {
            $tips .= "Provide small, frequent meals with fruits, vegetables, and protein. ";
        } else {
            $tips .= "Offer balanced meals including grains, proteins, and fresh produce. ";
        }

        // Sex-based minor tweaks (optional, more detailed logic can be added)
        if (strtolower($sex) === 'male') {
            $tips .= "Boys may benefit from slightly higher protein intake for growth. ";
        } else {
            $tips .= "Girls may benefit from iron-rich foods and calcium for bone health. ";
        }

        // BMI-based advice (quick check)
        if ($bmi < 14) {
            $tips .= "Consider nutrient-rich snacks to support weight gain. ";
        } elseif ($bmi > 18) {
            $tips .= "Encourage activity and limit high-calorie snacks. ";
        }

        return $tips;
    }
}

