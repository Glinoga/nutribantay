<?php

namespace App\Helpers;

class AIRecommender
{
    public static function getRecommendation(string $status, string $sex, int|float $ageInMonths, int|float $bmi, ?string $vitaminA = null, ?string $deworming = null): string
    {
        if ($status === null || $status === '' || $sex === null || $sex === '' || $ageInMonths === null) {
            return 'Hindi sapat ang datos para gumawa ng recommendation.';
        }

        $ageMonths = (int) floor($ageInMonths);

        if ($ageMonths < 6) {
            return self::getGatasOnlyRecommendation();
        }

        $tips = self::generateTips($status, $ageMonths, $sex);

        $mealPlan = self::generateMealPlan($ageMonths);

        // Enhanced vitamins and nutrients based on health assessment
        $vitamins = self::getSupplementRecommendations($vitaminA, $deworming, $ageMonths, $status);

        $output = "MGA NUTRITIOUS NA TIP:\n";
        foreach ($tips as $index => $tip) {
            $output .= ($index + 1).'. '.$tip."\n";
        }

        $output .= "\nMEAL PLAN PARA SA ISANG ARAW:\n";
        $output .= 'Umaga: '.$mealPlan['morning']."\n";
        $output .= 'Tanghali: '.$mealPlan['afternoon']."\n";
        $output .= 'Gabi: '.$mealPlan['evening']."\n";

        if (! empty($vitamins)) {
            $output .= "\nMGA VITAMIN AT NUTRIENTS:\n".$vitamins."\n";
        }

        $output .= "\nMGA RESTRICTIONS SA PAGKAIN:\n";
        $output .= "- Iwasan ang mga processed foods tulad ng instant noodles, de-lata, soft drinks, at packaged snacks.\n";
        $output .= "- Iwasan ang matatamis na pagkain at candies.\n";
        if ($status === 'Underweight') {
            $output .= "- Siguraduhing may sapat na protina at calories sa bawat meal.\n";
        } elseif ($status === 'Overweight' || $status === 'Obese') {
            $output .= "- Limitahan ang matatamis at matatabang pagkain. Encourage ang physical activity.\n";
        }

        $output .= "\nDISCLAIMER: Ang rekomendasyong ito ay batay sa National Nutrition Council guidelines at hindi kapalit ng medikal na payo mula sa doktor o nutritionist.\n";

        $output .= "\nPinagkuhanan ng Datos: National Nutrition Council\n";

        $output .= "\nPAALALA: Kumunsulta sa pinakamalapit na health center para sa karagdagang gabay at pagsusuri sa nutrisyon ng iyong anak.";

        return $output;
    }

    private static function getGatasOnlyRecommendation(): string
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

        $output .= "\nMGA RESTRICTIONS SA PAGKAIN:\n";
        $output .= "- WALANG solid food para sa 0-5 buwan - gatas lamang ang kailangan.\n";
        $output .= "- Iwasan ang anumang pagkain maliban sa breastmilk o formula.\n";

        $output .= "\nDISCLAIMER: Ang rekomendasyong ito ay batay sa National Nutrition Council guidelines at hindi kapalit ng medikal na payo mula sa doktor o nutritionist.\n";

        $output .= "\nPinagkuhanan ng Datos: National Nutrition Council\n";

        $output .= "\nPAALALA: Kumunsulta sa pinakamalapit na health center para sa karagdagang gabay at pagsusuri sa nutrisyon ng iyong anak.";

        return $output;
    }

    private static function getNCSMealOptions(int $ageMonths): array
    {
        if ($ageMonths < 6) {
            return [];
        } elseif ($ageMonths <= 6) {
            return ['Malapot na Lugaw (2-3 kutsara)'];
        } elseif ($ageMonths <= 8) {
            return [
                'Lugaw na may kalabasa (1/2 tasa)',
                'Lugaw na may malunggay (1/2 tasa)',
                'Lugaw na may pritong isda (1/2 tasa)',
            ];
        } elseif ($ageMonths <= 11) {
            return [
                'Lugaw na monggo, sayote, at saluyot (1/2 tasa)',
                'Papaya na minasa (1/2 tasa)',
                'Lugaw na may kalabasa at pritong isda (1/2 tasa)',
                'Kalabasa at repolyong sopas (1/2 tasa)',
            ];
        } else {
            return [
                'Ginisang gulay (1 tasa kanin + 1/2 tasa ulam)',
                'Hiniwang saging (1 tasa)',
                'Ginataang kadyos na may kalabasa (1 tasa kanin + 1/2 tasa ulam)',
                'Hiniwang itlog (1 tasa)',
                'Sinampalukang manok (1 tasa kanin + 1/2 tasa ulam)',
            ];
        }
    }

    private static function generateTips(string $status, int $ageMonths, string $sex): array
    {
        $tips = [];

        if ($ageMonths < 6) {
            $tips[] = 'Siguraduhing makakuha ng sapat na gatas (breastmilk o formula) araw-araw.';
            $tips[] = 'I breastfeeding ang baby tuwing 2-3 oras, o ayon sa kagustuhan ng baby.';
            $tips[] = 'Tiyaking maayos ang pagkakahawak ng baby sa nipples para sa tamang pagdede.';
            $tips[] = 'Magpakonsulta sa pediatrician para sa regular na check-up at tamang paglaki ng baby.';

            return $tips;
        }

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
        } elseif ($ageMonths >= 12) {
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

        if ($ageMonths >= 12) {
            if (strtolower($sex) === 'male') {
                $tips[] = 'Mahalaga ang sapat na protina para sa tamang paglaki ng mga bata.';
            } else {
                $tips[] = 'Mahalaga ang iron at calcium para sa kalusugan ng mga bata.';
            }
        }

        return $tips;
    }

    private static function generateMealPlan(int $ageMonths): array
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

    private static function getSupplementRecommendations(?string $vitaminA, ?string $deworming, int $ageMonths, string $status): string
    {
        $recommendations = [];
        $isSevere = str_starts_with($status, 'Severely ');
        $baseStatus = $isSevere ? substr($status, 9) : $status;

        // Universal: Vitamin A for all 6+ months (if not yet given)
        if ($ageMonths >= 6 && ($vitaminA === 'No' || $vitaminA === null)) {
            $dose = $ageMonths < 12 ? '100,000 IU' : '200,000 IU';
            $recommendations[] = "Vitamin A ({$dose}) — kunin sa health center tuwing 6 na buwan. Mahalaga para sa immune system at paningin.";
        }

        // Universal: Deworming for all 12+ months (if not yet given)
        if ($ageMonths >= 12 && ($deworming === 'No' || $deworming === null)) {
            $recommendations[] = 'Deworming (Albendazole o Mebendazole) — inumin tuwing 6 na buwan. Mahalaga para maiwasan ang worm infection na nagdudulot ng malnutrisyon.';
        }

        // Status-specific vitamins and nutrients
        switch ($baseStatus) {
            case 'Underweight':
                if ($ageMonths >= 6) {
                    $recommendations[] = 'Iron (Ferrous Sulfate drops) — 1 patak/kg araw-araw sa loob ng 60 araw. Mahalaga para sa red blood cells at dagdag energy.';
                }
                $recommendations[] = 'Zinc — tumutulong sa gana kumain at tamang paglaki. Bigyan ng zinc-rich foods tulad ng isda, manok, at itlog.';
                $recommendations[] = 'Multivitamins — para sa pangkalahatang kalusugan at dagdag na nutrients.';
                $recommendations[] = 'High-protein foods — isama ang itlog, isda, manok, at monggo sa araw-araw para sa weight gain.';
                break;

            case 'Stunted':
                $recommendations[] = 'Zinc — pinakamahalaga para sa linear growth at height development. Bigyan ng shellfish, karne, at itlog.';
                if ($ageMonths >= 6) {
                    $recommendations[] = 'Iron (Ferrous Sulfate drops) — 1 patak/kg araw-araw sa loob ng 60 araw. Mahalaga para sa overall development.';
                }
                $recommendations[] = 'Calcium — para sa buto. Magdagdag ng maliliit na isda (dilis), gatas, at dark green leafy vegetables.';
                $recommendations[] = 'Vitamin D — tumutulong sa calcium absorption. Maglaro sa araw (maaga sa umaga) ng 10-15 minuto.';
                break;

            case 'Wasted':
                $recommendations[] = 'Iron (Ferrous Sulfate drops) — 1 patak/kg araw-araw. Kritikal para sa malnutrisyon recovery.';
                $recommendations[] = 'Zinc — mahalaga para sa immune system at paghilom ng tissue.';
                $recommendations[] = 'Multivitamins — agarang nutritional support para sa severe malnutrition.';
                $recommendations[] = 'High-energy therapeutic foods — kumunsulta sa health center para sa ready-to-use therapeutic foods (RUTF).';
                $recommendations[] = '⚠️ KAILANGAN NG MEDICAL CONSULTATION — dalhin agad sa health center o doctor para sa tamang assessment at treatment.';
                break;

            case 'Overweight':
            case 'Obese':
                $recommendations[] = 'Vitamin B complex — tumutulong sa metabolism ng carbohydrates, protina, at taba.';
                $recommendations[] = 'Fiber — magdagdag ng prutas, gulay, at whole grains para sa digestion at pagkabusog.';
                $recommendations[] = 'Limitahan ang matatamis na pagkain, soft drinks, at processed foods.';
                $recommendations[] = 'Hikayatin ang regular na pisikal na aktibidad — paglalaro sa labas, pagtakbo, at iba pa.';
                break;

            default: // Normal
                if ($ageMonths >= 6) {
                    $recommendations[] = 'Iron (Ferrous Sulfate drops) — 1 patak/kg araw-araw sa loob ng 60 araw bilang maintenance.';
                }
                $recommendations[] = 'Patuloy ang balanced diet na may prutas, gulay, protina, at carbohydrates.';
                break;
        }

        // Severe case additional note
        if ($isSevere && $baseStatus !== 'Wasted') {
            $recommendations[] = '⚠️ KAILANGAN NG MEDICAL CONSULTATION — dalhin sa pinakamalapit na health center o doctor para sa tamang assessment.';
        }

        return implode("\n", $recommendations);
    }
}
