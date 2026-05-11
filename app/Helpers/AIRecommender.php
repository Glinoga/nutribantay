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

        // For 0-5 months, return gatas-only recommendation
        if ($ageMonths < 6) {
            return self::getGatasOnlyRecommendation($status);
        }

        $ageYears = floor($ageMonths / 12);
        $remainingMonths = $ageMonths % 12;

        // Determine feeding stage
        if ($ageMonths < 12) {
            $feedingStage = '6-11 months - Breastmilk + soft foods (mashed/pureed)';
        } else {
            $feedingStage = '12+ months - Regular solid foods';
        }

        // Base foods for different ages
        $baseFoods = self::getBaseFoodsForAge($ageMonths);

        // Generate tips based on status and age
        $tips = self::generateTips($status, $ageMonths, $sex);

        // Generate meal plan
        $mealPlan = self::generateMealPlan($ageMonths, $status, $baseFoods);

        // Personalized recommendations (age-aware)
        $supplements = self::getSupplementRecommendations($vitaminA, $deworming, $ageMonths);

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

    private static function getGatasOnlyRecommendation(string $status): string
    {
        $tips = [];
        $tips[] = 'Siguraduhing makakuha ng sapat na gatas (breastmilk o formula) araw-araw.';
        $tips[] = 'I breastfeeding ang baby tuwing 2-3 oras, o ayon sa kagustuhan ng baby.';
        $tips[] = 'Tiyaking maayos ang pagkakahawak ng baby sa nipples para sa tamang pagdede.';
        $tips[] = 'Magpakonsulta sa pediatrician para sa regular na check-up at tamang paglaki ng baby.';

        $output = "MGA NUTRITIOUS NA TIP:\n";
        foreach ($tips as $index => $tip) {
            $output .= ($index + 1).'. '.$tip."\n";
        }

        $output .= "\nMEAL PLAN PARA SA ISANG ARAW:\n";
        $output .= "Umaga: Gatas lamang (breastmilk o formula)\n";
        $output .= "Tanghali: Gatas lamang (breastmilk o formula)\n";
        $output .= "Gabi: Gatas lamang (breastmilk o formula)\n";

        $output .= "\nPAALALA: Kumunsulta sa pinakamalapit na health center para sa karagdagang gabay at pagsusuri sa nutrisyon ng iyong anak.";

        return $output;
    }

    private static function getNCSMealOptions(int $ageMonths): array
    {
        // National Nutrition Council Guidelines
        if ($ageMonths < 6) {
            return []; // 0-5 months: gatas only
        } elseif ($ageMonths === 6) {
            return ['Malapot na Lugaw (2-3 kutsara)'];
        } elseif ($ageMonths >= 7 && $ageMonths <= 8) {
            return [
                'Lugaw na may kalabasa (1/2 tasa)',
                'Lugaw na may malunggay (1/2 tasa)',
                'Lugaw na may pritong isda (1/2 tasa)',
            ];
        } elseif ($ageMonths >= 9 && $ageMonths <= 11) {
            return [
                'Lugaw na monggo, sayote, at saluyot (1/2 tasa)',
                'Papaya na minasa (1/2 tasa)',
                'Lugaw na may kalabasa at pritong isda (1/2 tasa)',
                'Kalabasa at repolyong sopas (1/2 tasa)',
            ];
        } else {
            // 12-23+ months
            return [
                'Ginisang gulay (1 tasa kanin + 1/2 tasa ulam)',
                'Hiniwang saging (1 tasa)',
                'Ginataang kadyos na may kalabasa (1 tasa kanin + 1/2 tasa ulam)',
                'Hiniwang itlog (1 tasa)',
                'Sinampalukang manok (1 tasa kanin + 1/2 tasa ulam)',
            ];
        }
    }

    private static function getBaseFoodsForAge(int $ageMonths): array
    {
        return self::getNCSMealOptions($ageMonths);
    }

    private static function generateTips(string $status, int $ageMonths, string $sex): array
    {
        $tips = [];

        // For 0-5 months (gatas-only age)
        if ($ageMonths < 6) {
            $tips[] = 'Siguraduhing makakuha ng sapat na gatas (breastmilk o formula) araw-araw.';
            $tips[] = 'I breastfeeding ang baby tuwing 2-3 oras, o ayon sa kagustuhan ng baby.';
            $tips[] = 'Tiyaking maayos ang pagkakahawak ng baby sa nipples para sa tamang pagdede.';
            $tips[] = 'Magpakonsulta sa pediatrician para sa regular na check-up at tamang paglaki ng baby.';

            return $tips;
        }

        // For 6-11 months (soft foods age)
        if ($ageMonths >= 6 && $ageMonths < 12) {
            switch ($status) {
                case 'Underweight':
                    $tips[] = 'Ang bata ay may mababang timbang para sa edad. Magbigay ng masustansiyang soft foods na may mataas na calories.';
                    $tips[] = 'Dapat kumain ng maliit na frequent na meals (3-4 beses sa isang araw).';
                    $tips[] = 'Magdagdag ng maliliit na quantity ng mantikilya o langis sa lugaw para sa dagdag na calories.';
                    break;

                case 'Overweight':
                    $tips[] = 'Ang bata ay may mataas na timbang para sa edad. Limitahan ang matatamis na pagkain at formula na may mataas na sugar.';
                    $tips[] = 'Panatilihin ang breastfeeding kung posible, at iwasan ang overfeeding.';
                    $tips[] = 'Huwag pilitin ang baby na kumain kung hindi gutom.';
                    break;

                default:
                    $tips[] = 'Magpatuloy sa pagbibigay ng masusustansiyang soft foods tulad ng lugaw, mashed fruits, at pureed vegetables.';
                    $tips[] = 'Dapat 3-4 na maliit na meals sa isang araw kasama ang breastfeeding.';
            }
            $tips[] = 'Para sa edad na '.$ageMonths.' buwan, lahat ng pagkain ay dapat MASHED o PUREED.';
        }
        // For 12+ months (regular solids age)
        elseif ($ageMonths >= 12) {
            switch ($status) {
                case 'Underweight':
                    $tips[] = 'Ang bata ay may mababang timbang para sa edad. Magbigay ng masustansiyang pagkain na may mataas na protina at calories.';
                    $tips[] = 'Dapat kumain ng 3-4 na beses sa isang araw. Hindi dapat skip ang anumang meal.';
                    $tips[] = 'Magdagdag ng dagdag na protina tulad ng itlog, manok, o isda sa pagkain.';
                    break;

                case 'Overweight':
                    $tips[] = 'Ang bata ay may mataas na timbang para sa edad. Limitahan ang matatamis at maasim na pagkain.';
                    $tips[] = 'Dapat magkaroon ng regular na pisikal na aktibidad tulad ng paglalaro sa labas.';
                    $tips[] = 'Iwasan ang mga processed foods at soft drinks.';
                    break;

                default:
                    $tips[] = 'Magpatuloy sa balanseng pagkain na may prutas, gulay, protina, at carbohydrates.';
                    $tips[] = 'Dapat regular ang pagkain at hindi skip ang anumang meal.';
            }
        }

        // Sex-based tip (only for 12+ months)
        if ($ageMonths >= 12) {
            if (strtolower($sex) === 'male') {
                $tips[] = 'Mahalaga ang sapat na protina para sa tamang paglaki ng mga bata.';
            } else {
                $tips[] = 'Mahalaga ang iron at calcium para sa kalusugan ng mga bata.';
            }
        }

        return $tips;
    }

    private static function generateMealPlan(int $ageMonths, string $status, array $baseFoods): array
    {
        // For 0-5 months - gatas only
        if ($ageMonths < 6) {
            return [
                'morning' => 'Gatas lamang (breastmilk o formula)',
                'afternoon' => 'Gatas lamang (breastmilk o formula)',
                'evening' => 'Gatas lamang (breastmilk o formula)',
            ];
        }

        // For 6+ months - use NCS guidelines with NO REPEATS
        $options = self::getNCSMealOptions($ageMonths);

        if (empty($options)) {
            return [
                'morning' => 'Gatas lamang (breastmilk o formula)',
                'afternoon' => 'Gatas lamang (breastmilk o formula)',
                'evening' => 'Gatas lamang (breastmilk o formula)',
            ];
        }

        // Shuffle and pick 3 different meals for morning/afternoon/evening
        shuffle($options);
        $selected = array_slice($options, 0, 3);

        // If fewer than 3 options, repeat some (with different order)
        while (count($selected) < 3) {
            $selected[] = $options[array_rand($options)];
        }

        return [
            'morning' => $selected[0],
            'afternoon' => $selected[1],
            'evening' => $selected[2],
        ];
    }

    private static function getSupplementRecommendations($vitaminA, $deworming, int $ageMonths): string
    {
        $recommendations = [];

        // Vitamin A: WHO recommends for 6-59 months (6+ months)
        if ($ageMonths >= 6 && ($vitaminA === 'No' || $vitaminA === null)) {
            $recommendations[] = 'Kumuha ng Vitamin A capsule mula sa health center - importante para sa mata at immune system.';
        }

        // Deworming: WHO recommends for 12+ months (12+ months)
        if ($ageMonths >= 12 && ($deworming === 'No' || $deworming === null)) {
            $recommendations[] = 'Deworming tablets dapat kumuha sa health center taun-taon para maiwasan ang worm infection.';
        }

        return implode("\n", $recommendations);
    }
}
