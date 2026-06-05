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
}
