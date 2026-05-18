<?php

namespace App\Http\Controllers;

use App\Helpers\AIRecommender;
use App\Models\Child;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class RecommendationController extends Controller
{
    private const MAX_RETRIES = 2;

    private const VALIDATION_FAILED = 'VALIDATION_FAILED';

    public function generate(Request $request)
    {
        $apiKey = config('openai.api_key');

        // Step 1: Validate and fetch child (no eager load - load healthLogs only when needed)
        $user = auth()->user();
        $child = Child::where('barangay', $user->barangay)->find($request->child_id);

        if (! $child || ! $child->birthdate) {
            return response()->json(['recommendation' => '❌ Child data incomplete.']);
        }

        // Step 2: Calculate age accurately
        $birthdate = Carbon::parse($child->birthdate);
        $now = Carbon::now();
        $totalMonths = (int) $birthdate->diffInMonths($now);
        $years = floor($totalMonths / 12);
        $months = $totalMonths % 12;
        $ageFormatted = "{$years} taon, {$months} buwan";

        // Step 3: Get child data — healthlog first, fall back to child record
        $latestHealthLog = $child->healthLogs()->latest()->first();
        $bmi = $request->bmi ?? $latestHealthLog?->bmi ?? $child->bmi ?? 0;
        $nutritionStatus = $request->nutrition_status ?? $latestHealthLog?->nutrition_status ?? $child->nutrition_status ?? 'Normal';

        // Step 4: Get Vitamin A and Deworming status from health log (latest one)
        $vitaminAStatus = $latestHealthLog?->vitamin_a ? 'Yes' : 'No';
        $dewormingStatus = $latestHealthLog?->deworming ? 'Yes' : 'No';

        // Compute deworming recommendation flag - only for 12+ months AND no deworming yet
        $needsDeworming = ($totalMonths >= 12 && $dewormingStatus === 'No') ? 'Yes' : 'No';

        // Step 5: Build the prompt
        $prompt = $this->buildPrompt(
            ageFormatted: $ageFormatted,
            months: $totalMonths,
            birthdate: $child->birthdate,
            sex: $child->sex,
            bmi: $bmi,
            nutritionStatus: $nutritionStatus,
            vitaminAStatus: $vitaminAStatus,
            dewormingStatus: $dewormingStatus,
            needsDeworming: $needsDeworming
        );

        // Step 7: Try API with retry logic
        $recommendation = $this->generateWithRetry($apiKey, $prompt, $totalMonths, $nutritionStatus, $child->sex, $totalMonths, $bmi, $vitaminAStatus, $dewormingStatus);

        // Step 8: Post-process to fix any meals with only light foods
        $recommendation = $this->fixMealPlan($recommendation, $totalMonths);

        // Step 9: Post-process to fix deworming if AI missed it
        $recommendation = $this->fixDewormingRecommendation($recommendation, $totalMonths, $dewormingStatus);

        return response()->json(['recommendation' => trim($recommendation)]);
    }

    private function buildPrompt(
        string $ageFormatted,
        int $months,
        string $birthdate,
        string $sex,
        float $bmi,
        string $nutritionStatus,
        string $vitaminAStatus,
        string $dewormingStatus,
        string $needsDeworming,
    ): string {
        return "
Ikaw ay isang AI nutrition assistant para sa mga barangay health workers sa Pilipinas.
Sagutin sa simpleng Tagalog. Huwag lalampas sa 500 tokens.

IMPORMASYON NG BATA:
- Edad: {$ageFormatted} ({$months} buwan)
- Petsa ng kapanganakan: {$birthdate}
- Kasarian: {$sex}
- BMI: {$bmi}
- Nutrition Status: {$nutritionStatus}
- Vitamin A: {$vitaminAStatus}
- Deworming: {$dewormingStatus}
- NEEDS DEWORMING: {$needsDeworming}

NATIONAL NUTRITION COUNCIL FEEDING GUIDELINES (STRICT - SUNUGIN LAMANG):
====================================================================================

0-5 BUWAN (Gatas lamang):
- Dalas: 8-12 beses isang araw (on-demand)
- Pagkain: Gatas lamang (breastmilk o formula) - WALANG SOLID FOOD

6 NA BUWAN:
- Dalas: 2 beses isang araw
- Pagkain: Malapot na Lugaw (2-3 kutsara)

6-8 BUWAN:
- Dalas: 2-3 beses isang araw
- Pagkain (PUMILI NG ISA PER MEAL - HUWAG UMIULIT):
  - Lugaw na may kalabasa (1/2 tasa)
  - Lugaw na may malunggay (1/2 tasa)
  - Lugaw na may pritong isda (1/2 tasa)

9-11 BUWAN:
- Dalas: 3-4 beses isang araw + 2 meryenda
- Pagkain (PUMILI NG ISA PER MEAL - HUWAG UMIULIT):
  - Lugaw na monggo, sayote, at saluyot (1/2 tasa)
  - Papaya na minasa (1/2 tasa)
  - Lugaw na may kalabasa at pritong isda (1/2 tasa)
  - Kalabasa at repolyong sopas (1/2 tasa)

12-23 BUWAN:
- Dalas: 4-5 beses isang araw + 2 meryenda
- Pagkain (PUMILI NG ISA PER MEAL - HUWAG UMIULIT):
  - Ginisang gulay (1 tasa kanin + 1/2 tasa ulam)
  - Hiniwang saging (1 tasa)
  - Ginataang kadyos na may kalabasa (1 tasa kanin + 1/2 tasa ulam)
  - Hiniwang itlog (1 tasa)
  - Sinampalukang manok (1 tasa kanin + 1/2 tasa ulam)

24+ BUWAN:
- Dalas: 4-5 beses isang araw + 2 meryenda
- Pagkain: Regular solid foods - sundin ang 12-23 months guidelines

STRICT RULES:
1. **Bawat meal AY ISANG PAGKAIN LAMANG** sa listahan - HUWAG COMBINE
2. **HUWAG UMIULIT NG PAGKAIN SA SAME DAY** - iba dapat bawat meal (Umaga/Tanghali/Gabi)
3. **0-5 months: GATAS LAMANG - WALANG SOLID FOOD**
4. **Bawal ang processed foods**: instant noodles, de-lata, soft drinks, packaged snacks
5. **Bawal ang pagkain na wala sa listahan**
6. **Deworming**: sundin ang NEEDS DEWORMING field - magbigay kung Yes, huwag kung No

OUTPUT FORMAT:
1. Mga Nutrition Tips (3-4 items)
2. Meal Plan (Bawat meal ay ISA lamang - HUWAG COMBINE):
   - Umaga: [isang pagkain sa listahan]
   - Tanghali: [isang pagkain sa listahan - DI IULIT]
   - Gabi: [isang pagkain sa listahan - DI IULIT]
3. Mga Vitamin/Supplements (ayon sa status)
4. Food Restrictions
5. Disclaimer
6. Pinagkuhanan ng Datos: National Nutrition Council

IMPORTANT: Huwag gamitin ang pangalan ng bata sa output. Suriin ang validity bago ilabas ang sagot. HUWAG GUMAMIT NG # (HASHTAG) SA OUTPUT.
";
    }

    private function generateWithRetry(string $apiKey, string $prompt, int $totalMonths, string $nutritionStatus, string $sex, int $months, float $bmi, string $vitaminAStatus, string $dewormingStatus): string
    {
        // Skip API calls if no API key configured
        if (empty($apiKey)) {
            \Log::info('No OpenAI API key configured, using local fallback');

            return $this->getLocalFallback(
                $nutritionStatus,
                $sex,
                $totalMonths,
                $bmi,
                $vitaminAStatus,
                $dewormingStatus
            );
        }

        $attempts = 0;
        $lastError = null;
        $lastValidationError = null;

        while ($attempts <= self::MAX_RETRIES) {
            $attempts++;

            // If not first attempt, add generic warning to retry
            if ($attempts > 1 && $lastValidationError) {
                $prompt .= "\n\n⚠️ WARNING: Ang nakaraang sagot ay INVALID. Paki-correct ang output ayon sa validation rules!";
            }

            try {
                $response = Http::withHeaders([
                    'Authorization' => "Bearer {$apiKey}",
                    'Content-Type' => 'application/json',
                ])->post('https://api.openai.com/v1/chat/completions', [
                    'model' => 'gpt-4o-mini',
                    'messages' => [
                        ['role' => 'system', 'content' => 'Ikaw ay AI nutrition assistant para sa Filipino children.'],
                        ['role' => 'user', 'content' => $prompt],
                    ],
                    'max_tokens' => 600,
                    'temperature' => 0.5,
                ]);

                if (! $response->successful()) {
                    $lastError = 'API Error: '.$response->status();

                    continue;
                }

                $recommendation = $response->json('choices.0.message.content');

                // Validate the output with age context
                $validationResult = $this->validateRecommendation($recommendation, $totalMonths);

                if ($validationResult === true) {
                    return $recommendation;
                } else {
                    $lastValidationError = $validationResult;
                    $lastError = $validationResult;
                }

            } catch (\Throwable $e) {
                $lastError = $e->getMessage();

                continue;
            }
        }

        // All retries failed - use local fallback
        \Log::warning("AI recommendation failed after {$attempts} attempts. Using fallback. Last error: {$lastError}");

        return $this->getLocalFallback(
            $nutritionStatus,
            $sex,
            $totalMonths,
            $bmi,
            $vitaminAStatus,
            $dewormingStatus
        );
    }

    private function getLocalFallback(string $status, string $sex, int $ageInMonths, float $bmi, ?string $vitaminA = null, ?string $deworming = null): string
    {
        // Call the improved local recommender
        return AIRecommender::getRecommendation(
            $status,
            $sex,
            $ageInMonths,
            $bmi,
            $vitaminA,
            $deworming
        );
    }

    private function validateRecommendation(string $recommendation, int $ageInMonths = 0): true|string
    {
        // For 0-5 months, check that no solid foods are suggested
        if ($ageInMonths < 6) {
            $solidFoods = ['lugaw', 'kanin', 'kamote', 'tinapay', 'pasta', 'noodles', 'mais', 'itlog', 'karne', 'isda', 'manok', 'gulay', 'prutas'];
            $recLower = strtolower($recommendation);
            foreach ($solidFoods as $food) {
                if (strpos($recLower, $food) !== false) {
                    return self::VALIDATION_FAILED.': May solid food sa 0-5 months - dapat GATAS LAMANG!';
                }
            }
        }

        // Check for duplicate base foods in meal plan (for 6+ months)
        if ($ageInMonths >= 6) {
            $mealPlanPatterns = [
                '/Umaga:.*?Lugaw/i',
                '/Umaga:.*?Kanin/i',
                '/Umaga:.*?Kamote/i',
                '/Umaga:.*?Tinapay/i',
                '/Umaga:.*?Pasta/i',
                '/Umaga:.*?Noodles/i',
                '/Tanghali:.*?Lugaw/i',
                '/Tanghali:.*?Kanin/i',
                '/Tanghali:.*?Kamote/i',
                '/Tanghali:.*?Tinapay/i',
                '/Tanghali:.*?Pasta/i',
                '/Tanghali:.*?Noodles/i',
                '/Gabi:.*?Lugaw/i',
                '/Gabi:.*?Kanin/i',
                '/Gabi:.*?Kamote/i',
                '/Gabi:.*?Tinapay/i',
                '/Gabi:.*?Pasta/i',
                '/Gabi:.*?Noodles/i',
            ];

            $matches = [];
            foreach ($mealPlanPatterns as $pattern) {
                if (preg_match($pattern, $recommendation, $match)) {
                    $matches[] = $match[0];
                }
            }

            // Count how many unique base foods we found
            $lugawCount = preg_grep('/Lugaw/i', $matches);
            $kaninCount = preg_grep('/Kanin/i', $matches);
            $kamoteCount = preg_grep('/Kamote/i', $matches);
            $tinapayCount = preg_grep('/Tinapay/i', $matches);

            $differentBases = 0;
            if (! empty($lugawCount)) {
                $differentBases++;
            }
            if (! empty($kaninCount)) {
                $differentBases++;
            }
            if (! empty($kamoteCount)) {
                $differentBases++;
            }
            if (! empty($tinapayCount)) {
                $differentBases++;
            }

            // If we have duplicates, validation fails
            if (count($matches) > $differentBases) {
                return self::VALIDATION_FAILED.': May duplicate base food sa meal plan';
            }
        }

        // Check for processed foods (banned)
        $bannedFoods = ['Pancit Canton', 'De Lata', 'soft drinks', 'instant noodles'];
        foreach ($bannedFoods as $banned) {
            if (stripos($recommendation, $banned) !== false) {
                return self::VALIDATION_FAILED.': Banned food found: '.$banned;
            }
        }

        return true;
    }

    private function fixMealPlan(string $recommendation, int $ageInMonths): string
    {
        // Fix meals that have only light foods (prutas/gulay) without heavy food base
        $lines = explode("\n", $recommendation);
        $fixedLines = [];

        $heavyFoods = ['lugaw', 'kanin', 'kamote', 'tinapay', 'pasta', 'noodles', 'mais'];
        $lightFoods = ['saging', 'prutas', 'gulay', 'vegetables', 'salad', 'sabaw'];

        foreach ($lines as $line) {
            $lineLower = strtolower($line);

            // Check if this is a meal line
            if (preg_match('/^(Umaga|Tanghali|Gabi):\s*(.+)$/i', $line, $matches)) {
                $mealTime = $matches[1];
                $mealContent = trim($matches[2]);
                $mealContentLower = strtolower($mealContent);

                // Check if meal has heavy food
                $hasHeavyFood = false;
                foreach ($heavyFoods as $heavy) {
                    if (strpos($mealContentLower, $heavy) !== false) {
                        $hasHeavyFood = true;
                        break;
                    }
                }

                // For 0-5 months, override ALL meal lines to gatas-only
                if ($ageInMonths < 6) {
                    $mealContent = 'Gatas lamang (breastmilk/formula)';
                } elseif (! $hasHeavyFood && $ageInMonths < 12) {
                    // 6-11 months: NCS requires a carb base. Add lugaw if missing.
                    $mealContent = 'Lugaw na may '.$mealContent;
                    $line = $mealTime.': '.$mealContent;
                }
            }

            $fixedLines[] = $line;
        }

        return implode("\n", $fixedLines);
    }

    private function fixDewormingRecommendation(string $recommendation, int $ageInMonths, string $dewormingStatus): string
    {
        if ($ageInMonths >= 12 && strtolower($dewormingStatus) === 'no') {
            $medicineList = 'Deworming tablets';

            if (stripos($recommendation, 'deworming') === false) {
                // Handle multi-line format: line ending with newline
                $recommendation = preg_replace(
                    '/(Vitamin A[^\n]*\n)/i',
                    "$1- {$medicineList}\n",
                    $recommendation,
                    1
                );

                // Handle single-line format: "Vitamin A: description."
                if (stripos($recommendation, 'deworming') === false) {
                    $recommendation = preg_replace(
                        '/(Vitamin A[^.]*\.)/i',
                        "$1\n- {$medicineList}.",
                        $recommendation,
                        1
                    );
                }
            }
        }

        return $recommendation;
    }
}
