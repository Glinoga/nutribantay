<?php

namespace App\Http\Controllers;

use App\Helpers\AIRecommender;
use App\Models\Child;
use App\Models\Stock;
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

        // Step 1: Validate and fetch child
        $child = Child::with(['healthLogs' => function ($query) {
            $query->latest()->first();
        }])->find($request->child_id);

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

        // Step 3: Get child data
        $bmi = $request->bmi ?? $child->healthLogs?->first()?->bmi ?? 0;
        $nutritionStatus = $request->nutrition_status ?? $child->healthLogs?->first()?->nutrition_status ?? 'Normal';

        // Step 4: Get Vitamin A and Deworming status from health log (latest one)
        $latestHealthLog = $child->healthLogs()->latest()->first();
        $vitaminAStatus = $latestHealthLog?->vitamin_a ? 'Yes' : 'No';
        $dewormingStatus = $latestHealthLog?->deworming ? 'Yes' : 'No';

        // Compute deworming recommendation flag - only for 12+ months AND no deworming yet
        $needsDeworming = ($totalMonths >= 12 && $dewormingStatus === 'No') ? 'Yes' : 'No';

        // Step 5: Fetch stocks by authenticated user's barangay
        $user = auth()->user();
        $userBarangay = $user ? $user->barangay : $child->barangay;
        $stocks = Stock::where('barangay', $userBarangay)->get();
        $foodItems = $stocks->where('category', 'food')->pluck('item_name')->toArray();
        $vitaminItems = $stocks->where('category', 'vitamin')->pluck('item_name')->toArray();

        $foodList = ! empty($foodItems) ? implode(', ', $foodItems) : 'Walang available na pagkain sa barangay.';
        $vitaminList = ! empty($vitaminItems) ? implode(', ', $vitaminItems) : 'Walang available na vitamin sa barangay.';

        // Step 6: Build the prompt
        $prompt = $this->buildPrompt(
            ageFormatted: $ageFormatted,
            months: $totalMonths,
            birthdate: $child->birthdate,
            sex: $child->sex,
            bmi: $bmi,
            nutritionStatus: $nutritionStatus,
            vitaminAStatus: $vitaminAStatus,
            dewormingStatus: $dewormingStatus,
            needsDeworming: $needsDeworming,
            foodList: $foodList,
            vitaminList: $vitaminList
        );

        // Step 7: Try API with retry logic
        $recommendation = $this->generateWithRetry($apiKey, $prompt, $nutritionStatus, $child->sex, $months, $bmi, $vitaminAStatus, $dewormingStatus);

        // Step 8: Post-process to fix any meals with only light foods
        $recommendation = $this->fixMealPlan($recommendation, $months);

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
        string $foodList,
        string $vitaminList
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

AVAILABLE SA BARANGAY:
- Pagkain: {$foodList}
- Vitamins: {$vitaminList}

FEEDING RULES (STRICT):
- 0-5 months: Gatas lamang (breastmilk/formula) - WALANG SOLID FOOD
- 6-11 months: Breastmilk + soft foods (lugaw, mashed fruits/vegetables)
- 12-35 months: Lugaw/Kanin na may gulay at itlog, may prutas
- 36+ months: Regular solid foods - dapat may base food + side dish

MEAL FORMAT (STRICT - Bawat meal dapat may heavy food + side dish):
HALIMBAWA NG VALID MEAL PLAN (para sa 3+ taong gulang):
- Umaga: Lugaw na may itlog at gulay
- Tanghali: Kanin na may tinadtad na karne at gulay
- Gabi: Kamote na may sabaw at prutas
HALIMBAWA NG INVALID (HINDI PUWEDE):
- Tanghali: Saging lang (WALANG BASE FOOD!)
- Gabi: Gulay lang (WALANG BASE FOOD!)
- Umaga: Lugaw lang (KAILANGAN MAY SIDE DISH!)

AGE-SPECIFIC MEAL EXAMPLES:
- 0-5 months: GATAS LAMANG - Walang solid food!
- 6-11 months: Lugaw na may MASHED fruits/vegetables, o soft na pagkain (PUREED)
- 12-35 months: Lugaw/Kanin na may gulay at itlog, may prutas
- 36+ months: Lugaw/Kanin/Kamote na may karne/gulay/prutas

**STRICT PARA SA 6-11 BUWAN:**
- Lahat ng pagkain ay dapat MASHED o PUREED
- Halimbawa: Lugaw na may MASHED na saging, Lugaw na may PUREED na gulay
- Bawal ang: sinigang, nilagang buo, steak, anumang hindi mashed

VALIDATION RULES (BAGO ILABAS ANG SAGOT, DAPAT PASSING LAHAT):
1. **Tatlong magkaibang base foods lamang** sa meal plan (Umaga, Tanghali, Gabi)
   - Bawal ang: lugaw, kanin, kamote, tinapay, pasta, noodles na paulit-ulit
   - Halimbawa ng valid: Umaga: Lugaw, Tanghali: Kanin, Gabi: Kamote
   - Halimbawa ng invalid: Umaga: Lugaw, Tanghali: Lugaw, Gabi: Lugaw (DOBULIN!)
2. **Bawal ang processed foods**: instant noodles, de-lata, soft drinks, packaged snacks
3. **Bawat meal dapat may heavy food (lugaw/kanin/kamote/tinapay)** - bawal ang prutas o gulay lang
4. **Light food (prutas/gulay) dapat KASAMA ng heavy food**, hindi pamalit sa heavy food
5. **0-5 months - GATAS LAMANG** - huwag magbigay ng anumang solid food
6. **6-11 months - SOFT FOODS LAMANG** - dapat mashed o pureed, huwag magbigay ng regular solid food

AGE-SPECIFIC RULES:
- 0-5 months: GATAS LAMANG (breastmilk/formula) - WALANG SOLID FOOD
- 6-11 months: SOFT FOODS - dapat MASHED o PUREED (hal. Lugaw na may MASHED na saging)
- 12-35 months: REGULAR SOLIDS - hindi na kailangan ng MASHED (hal. Lugaw na may gulay, Kanin na may itlog)
- 36+ months: Regular solid foods - buong pagkain pwede na

⚠️ CRITICAL: Kung ang bata ay 12-35 buwan, GAMITIN ANG REGULAR NA PORMAT - HUWAG GAMITIN ANG MASHED O PUREED!

DEWORMING RULE (MANDATORY - SUMUNOD SA NEEDS DEWORMING FIELD):
- Kung NEEDS DEWORMING = Yes: MAGBIGAY NG DEWORMING TABLETS SA OUTPUT
- Kung NEEDS DEWORMING = No: HUWAG MAGBIGAY NG DEWORMING SA OUTPUT

FOOD RESTRICTIONS FORMAT:
- Kung 0-5 months: Bawal ang anumang solid food - gatas lamang
- Kung 6-11 months: Lahat ng pagkain ay dapat mashed o pureed
- Kung 12+ months: Iwasan ang processed foods
- Huwag magbigay ng generic na text na bawal ang solid food kung ang bata ay 6 buwan na

OUTPUT FORMAT (Clean Version):
 1. Mga Nutrition Tips (3-4 items)
 2. Meal Plan:
    - Umaga: [pagkain]
    - Tanghali: [pagkain]
    - Gabi: [pagkain]
 3. Mga Vitamin/Supplements:
    - {$vitaminList}
 4. Food Restrictions (kung may)
 5. Disclaimer
 6. Pinagkuhanan ng Datos: National Nutrition Council

IMPORTANT: Huwag gamitin ang pangalan ng bata sa output. Suriin ang validity bago ilabas ang sagot.
";
    }

    private function generateWithRetry(string $apiKey, string $prompt, string $nutritionStatus, string $sex, int $months, float $bmi, string $vitaminAStatus, string $dewormingStatus): string
    {
        $attempts = 0;
        $lastError = null;

        while ($attempts <= self::MAX_RETRIES) {
            $attempts++;

            // If not first attempt, add stricter instruction
            if ($attempts > 1) {
                $prompt .= "\n\n⚠️ WARNING: Ang nakaraang sagot ay INVALID dahil may duplicate base food. Gumamit ng TATLONG MAGKAIBANG base foods sa meal plan!";
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

                // Validate the output
                $validationResult = $this->validateRecommendation($recommendation);

                if ($validationResult === true) {
                    return $recommendation;
                } else {
                    $lastError = $validationResult; // Validation failed reason
                    // Continue to retry
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
            $months,
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

    private function validateRecommendation(string $recommendation): true|string
    {
        // Check for duplicate base foods in meal plan
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

        // Remove duplicates and check if we have 3 different meals
        $uniqueBaseFoods = array_unique($matches);

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

                // If no heavy food, add one based on age
                if (! $hasHeavyFood) {
                    // Determine appropriate heavy food based on age
                    if ($ageInMonths < 6) {
                        // For 0-5 months, no solid food should be suggested
                        $mealContent = 'Gatas lamang (breastmilk/formula)';
                    } elseif ($ageInMonths < 12) {
                        // 6-11 months: add lugaw
                        $mealContent = 'Lugaw na may '.$mealContent;
                    } elseif ($ageInMonths < 36) {
                        // 12-35 months: add lugaw or kanin
                        $mealContent = 'Lugaw na may '.$mealContent;
                    } else {
                        // 36+ months: add appropriate base
                        $mealContent = 'Lugaw na may '.$mealContent;
                    }

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
            // Fetch medicine stocks for the user's barangay
            $user = auth()->user();
            $userBarangay = $user ? $user->barangay : null;
            $medicineList = 'Deworming tablets';

            if ($userBarangay) {
                $medicines = Stock::where('barangay', $userBarangay)
                    ->where('category', 'medicine')
                    ->pluck('item_name')
                    ->toArray();
                if (! empty($medicines)) {
                    $medicineList = implode(', ', $medicines);
                }
            }

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
