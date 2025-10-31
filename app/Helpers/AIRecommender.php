<?php

namespace App\Helpers;

class AIRecommender
{
    public static function getRecommendation($status, $sex, $age, $bmi)
    {
        if (empty($status) || empty($sex) || empty($age) || empty($bmi)) {
            return "Insufficient data to generate recommendation.";
        }

        // Convert to integer if age is fractional
        $age = floor($age);

        switch ($status) {
            case 'Underweight':
                return self::underweightAdvice($sex, $age);
            case 'Overweight':
                return self::overweightAdvice($sex, $age);
            default:
                return self::normalAdvice($sex, $age);
        }
    }

    private static function underweightAdvice($sex, $age)
    {
        $advice = "Your child appears underweight for their age. ";
        $advice .= "Consider incorporating more protein and energy-rich foods such as eggs, chicken, fish, beans, and dairy products. ";
        $advice .= "Ensure regular meal schedules and monitor their weight weekly. ";
        if ($age < 5) {
            $advice .= "Also, consult a pediatrician to rule out nutrient absorption issues or underlying conditions.";
        }
        return $advice;
    }

    private static function overweightAdvice($sex, $age)
    {
        $advice = "Your child appears overweight for their age. ";
        $advice .= "Encourage more outdoor play and reduce sugary or high-fat snacks. ";
        $advice .= "Serve balanced meals with fruits, vegetables, and lean proteins. ";
        if ($age > 10) {
            $advice .= "Engage them in at least 60 minutes of physical activity daily.";
        }
        return $advice;
    }

    private static function normalAdvice($sex, $age)
    {
        $advice = "Your child’s growth is within a healthy range. ";
        $advice .= "Maintain a balanced diet with adequate fruits, vegetables, and whole grains. ";
        $advice .= "Continue regular health checkups to ensure steady growth.";
        return $advice;
    }
}
