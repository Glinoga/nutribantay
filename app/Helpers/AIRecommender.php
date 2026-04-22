<?php

namespace App\Helpers;

class AIRecommender
{
    public static function getRecommendation($status, $sex, $ageInMonths, $bmi, $vitaminA = null, $deworming = null)
    {
        if (empty($status) || empty($sex) || empty($ageInMonths)) {
            return 'Hindi sapat ang datos para gumawa ng recommendation.';
        }

        $ageMonths = floor($ageInMonths);
        $ageYears = floor($ageMonths / 12);
        $remainingMonths = $ageMonths % 12;

        // Determine feeding stage
        if ($ageMonths < 6) {
            $feedingStage = '0-5 months - Gatas lamang (breastmilk o formula)';
        } elseif ($ageMonths < 12) {
            $feedingStage = '6-11 months - Breastmilk + soft foods';
        } else {
            $feedingStage = '12+ months - Regular solid foods';
        }

        // Base foods for different ages
        $baseFoods = self::getBaseFoodsForAge($ageMonths);

        // Generate tips based on status
        $tips = self::generateTips($status, $bmi, $ageMonths, $sex);

        // Generate meal plan
        $mealPlan = self::generateMealPlan($ageMonths, $status, $bmi, $baseFoods);

        // Personalized recommendations
        $supplements = self::getSupplementRecommendations($vitaminA, $deworming);

        $output = "MGA NUTRITIOUS NA TIP:\n";
        foreach ($tips as $index => $tip) {
            $output .= ($index + 1).'. '.$tip."\n";
        }

        $output .= "\nMEAL PLAN PARA SA ISANG ARAW:\n";
        $output .= 'Umaga: '.$mealPlan['morning']."\n";
        $output .= 'Tanghali: '.$mealPlan['afternoon']."\n";
        $output .= 'Gabi: '.$mealPlan['evening']."\n";

        if (! empty($supplements)) {
            $output .= "\nMGA SUPPLMENTS:\n".$supplements."\n";
        }

        $output .= "\nPAALALA: Kumunsulta sa pinakamalapit na health center para sa karagdagang gabay at pagsusuri sa nutrisyon ng iyong anak.";

        return $output;
    }

    private static function getBaseFoodsForAge(int $ageMonths): array
    {
        if ($ageMonths < 12) {
            // Infants and young toddlers
            return ['Lugaw', 'Mashed banana', 'Pureed vegetables'];
        } else {
            // Older toddlers and children
            return ['Lugaw', 'Kanin', 'Kamote', 'Tinapay', 'Mais'];
        }
    }

    private static function generateTips(string $status, float $bmi, int $ageMonths, string $sex): array
    {
        $tips = [];

        // Status-based tips
        switch ($status) {
            case 'Underweight':
                $tips[] = 'Ang bata ay may mababang timbang para sa edad. Magbigay ng masustansiyang pagkain na may mataas na protina at calories.';
                $tips[] = 'Dapat kumain ng 3-4 na beses sa isang araw. Hindi dapat skip ang anumang meal.';
                break;

            case 'Overweight':
                $tips[] = 'Ang bata ay may mataas na timbang para sa edad. Limitahan ang matatamis at maasim na pagkain.';
                $tips[] = 'Dapat magkaroon ng regular na pisikal na aktibidad tulad ng paglalaro sa labas.';
                break;

            default: // Normal
                $tips[] = 'Magpatuloy sa balanseng pagkain na may prutas, gulay, protina, at carbohydrates.';
                $tips[] = 'Dapat regular ang pagkain at hindi skip ang anumang meal.';
        }

        // Age-based tips
        if ($ageMonths < 24) {
            $tips[] = 'Para sa edad na '.$ageMonths.' buwan, mag-focus sa soft foods at maliit na frequent na meals.';
        } else {
            $tips[] = 'Para sa edad na '.$ageMonths.' buwan, puwedeng magbigay ng regular na solid foods na angkop sa edad.';
        }

        // Sex-based tip
        if (strtolower($sex) === 'male') {
            $tips[] = 'Mahalaga ang sapat na protina para sa tamang paglaki ng mga bata.';
        } else {
            $tips[] = 'Mahalaga ang iron at calcium para sa kalusugan ng mga bata.';
        }

        return $tips;
    }

    private static function generateMealPlan(int $ageMonths, string $status, float $bmi, array $baseFoods): array
    {
        // Ensure we have at least 3 different base foods
        $foods = array_slice($baseFoods, 0, 3);

        // Make sure we have 3 items, fill if needed
        while (count($foods) < 3) {
            $foods[] = 'Lugaw';
        }

        // Add side dishes based on age
        $morningSide = $ageMonths < 12 ? 'na may mashed banana' : 'na may itlog';
        $afternoonSide = $ageMonths < 12 ? 'na may pureed vegetables' : 'na may gulay';
        $eveningSide = $ageMonths < 12 ? 'na may maliit na prutas' : 'na may sabaw';

        // For underweight, add more calorie-dense options
        if ($status === 'Underweight') {
            $morningSide .= ' at mantikilya';
            $afternoonSide .= ' at kaunting karne';
        }

        // For overweight, keep it lighter
        if ($status === 'Overweight') {
            $morningSide = 'na may sariwang prutas';
            $afternoonSide = 'na may steamed vegetables';
            $eveningSide = 'na may light soup';
        }

        return [
            'morning' => $foods[0].' '.$morningSide,
            'afternoon' => $foods[1].' '.$afternoonSide,
            'evening' => $foods[2].' '.$eveningSide,
        ];
    }

    private static function getSupplementRecommendations($vitaminA, $deworming): string
    {
        $recommendations = [];

        if ($vitaminA === 'No' || $vitaminA === null) {
            $recommendations[] = 'Kumuha ng Vitamin A capsule mula sa health center - importante para sa mata at immune system.';
        }

        if ($deworming === 'No' || $deworming === null) {
            $recommendations[] = 'Deworming tablets dapat kumuha sa health center taun-taon para maiwasan ang worm infection.';
        }

        return implode("\n", $recommendations);
    }
}
