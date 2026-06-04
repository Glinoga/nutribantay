<?php

namespace App\Helpers;

class AIRecommender
{
    public static function getRecommendation(string $status, string $sex, int|float $ageInMonths, ?string $vitaminA = null, ?string $deworming = null, int $seed = 0): string
    {
        if ($status === null || $status === '' || $sex === null || $sex === '' || $ageInMonths === null) {
            return '';
        }

        return '';
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

    private static function generateMealPlan(int $ageMonths, int $seed = 0): array
    {
        if ($ageMonths < 6) {
            return [
                'morning' => 'Gatas lamang (breastmilk o formula)',
                'afternoon' => 'Gatas lamang (breastmilk o formula)',
                'evening' => 'Gatas lamang (breastmilk o formula)',
            ];
        }

        $options = self::getNCSMealOptions($ageMonths);

        if (empty($options)) {
            return [
                'morning' => 'Gatas lamang (breastmilk o formula)',
                'afternoon' => 'Gatas lamang (breastmilk o formula)',
                'evening' => 'Gatas lamang (breastmilk o formula)',
            ];
        }

        $optionCount = count($options);
        $daySeed = crc32($seed.date('Y-m-d'));
        $selected = [];
        for ($i = 0; $i < min(3, $optionCount); $i++) {
            $selected[] = $options[abs($daySeed + $i) % $optionCount];
        }
        while (count($selected) < 3) {
            $selected[] = $options[abs($daySeed + count($selected)) % $optionCount];
        }

        return [
            'morning' => $selected[0],
            'afternoon' => $selected[1],
            'evening' => $selected[2],
        ];
    }
}
