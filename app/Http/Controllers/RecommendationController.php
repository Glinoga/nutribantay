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
        $validated = $request->validate([
            'child_id' => 'required|integer|exists:children,id',
        ]);

        $user = auth()->user();
        $child = Child::where('barangay', $user->barangay)->find($validated['child_id']);

        if (! $child || ! $child->birthdate) {
            return response()->json(['recommendation' => '❌ Child data incomplete.']);
        }

        $child->abortIfOveraged();

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

VITAMINS AND NUTRIENTS REFERENCE (AYON SA NUTRITION STATUS):
=====================================================================
Gamitin ang reference na ito para sa 3. Mga Vitamin, Supplements, at Nutrients section.
**Para sa 0-5 buwan: WALANG vitamins o supplements — sapat na ang breastmilk o formula.**

LAHAT NG BATA (6-59 months):
- Vitamin A: Tuwing 6 na buwan (6-11mo: 100,000 IU, 12-59mo: 200,000 IU)
- Deworming: Tuwing 6 na buwan simula 12 months (Albendazole o Mebendazole)
- Iron (Ferrous Sulfate drops): 1 patak/kg araw-araw sa loob ng 60 araw (simula 6 months)

BATAY SA NUTRITION STATUS:
- Underweight: Iron (+), Zinc (gana kumain at paglaki), Multivitamins, High-protein foods
- Stunted: Zinc (linear growth), Iron, Calcium (buto), Vitamin D (sun exposure)
- Wasted: Iron, Zinc, Multivitamins, Therapeutic foods (RUTF), MEDICAL CONSULTATION
- Overweight/Obese: Vitamin B complex (metabolism), Fiber (digestion), limitahan asukal/taba
- Normal: Iron (maintenance), patuloy ang balanced diet

BAWAT RECOMMENDATION AY DAPAT:
a) Tukuyin ang SPECIFIC nutrient/vitamin (hindi lang pangkalahatan)
b) Ipaliwanag kung BAKIT ito kailangan para sa bata
c) Banggitin ang PAGKUKUNAN (dietary sources) kung maaari

STRICT RULES:
1. **Bawat meal AY ISANG PAGKAIN LAMANG** sa listahan - HUWAG COMBINE
2. **HUWAG UMIULIT NG PAGKAIN SA SAME DAY** - iba dapat bawat meal (Umaga/Tanghali/Gabi)
3. **0-5 months: GATAS LAMANG - WALANG SOLID FOOD, WALANG VITAMINS O SUPPLEMENTS**
4. **Bawal ang processed foods**: instant noodles, de-lata, soft drinks, packaged snacks
5. **Bawal ang pagkain na wala sa listahan**
6. **Deworming**: sundin ang NEEDS DEWORMING field - magbigay kung Yes, huwag kung No
7. **Vitamins/nutrients ay dapat naaayon sa Nutrition Status ng bata** - hindi lahat ay pare-pareho ang kailangan

OUTPUT FORMAT:
1. Mga Nutrition Tips (3-4 items)
2. Meal Plan (Bawat meal ay ISA lamang - HUWAG COMBINE):
   - Umaga: [isang pagkain sa listahan]
   - Tanghali: [isang pagkain sa listahan - DI IULIT]
   - Gabi: [isang pagkain sa listahan - DI IULIT]
3. Mga Vitamin, Supplements, at Nutrients (ayon sa health assessment ng bata)
4. Food Restrictions
5. Disclaimer
6. Pinagkuhanan ng Datos: National Nutrition Council

IMPORTANT: Huwag gamitin ang pangalan ng bata sa output. Suriin ang validity bago ilabas ang sagot. HUWAG GUMAMIT NG # (HASHTAG) SA OUTPUT.
";
    }

    private function generateWithRetry(string $apiKey, string $prompt, int $totalMonths, string $nutritionStatus, string $sex, int $months, float $bmi, string $vitaminAStatus, string $dewormingStatus): string
    {
        if (empty($apiKey)) {
            \Log::info('No OpenAI API key configured');

            return '⚠️ Hindi makagawa ng recommendation dahil walang OpenAI API key.';
        }

        $attempts = 0;
        $lastError = null;
        $lastValidationError = null;
        $lastResponse = null;

        while ($attempts <= self::MAX_RETRIES) {
            $attempts++;

            if ($attempts > 1 && $lastValidationError) {
                $prompt .= "\n\n⚠️ WARNING: Ang nakaraang sagot ay INVALID. Paki-correct ang output ayon sa validation rules!";
            }

            try {
                $response = Http::timeout(30)->connectTimeout(10)->withHeaders([
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
                $lastResponse = $recommendation;

                $validationResult = $this->validateRecommendation($recommendation, $totalMonths);

                if ($validationResult === true) {
                    return $recommendation;
                } else {
                    $lastValidationError = $validationResult;
                    $lastError = $validationResult;
                    \Log::warning('AI validation failed, keeping response as fallback', ['error' => $validationResult]);
                }

            } catch (\Throwable $e) {
                $lastError = $e->getMessage();

                continue;
            }
        }

        if ($lastResponse) {
            \Log::warning("AI recommendation failed validation after {$attempts} attempts, falling back to local AI recommender. Error: {$lastError}");

            return $this->getLocalFallback($nutritionStatus, $sex, $months, $bmi, $vitaminAStatus, $dewormingStatus);
        }

        \Log::error("AI recommendation failed after {$attempts} attempts with no valid response. Error: {$lastError}");

        return $this->getLocalFallback($nutritionStatus, $sex, $months, $bmi, $vitaminAStatus, $dewormingStatus);
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
        // For 0-5 months, check that meal plan lines don't contain solid foods
        // (restrictions/disclaimers may mention foods to avoid — that's fine)
        if ($ageInMonths < 6) {
            $solidFoods = ['lugaw', 'kanin', 'kamote', 'tinapay', 'pasta', 'noodles', 'mais', 'itlog', 'karne', 'isda', 'manok', 'gulay', 'prutas'];
            foreach (preg_split('/\R/', $recommendation) as $line) {
                if (preg_match('/^(Umaga|Tanghali|Gabi):/i', $line)) {
                    $lineLower = strtolower($line);
                    foreach ($solidFoods as $food) {
                        if (strpos($lineLower, $food) !== false) {
                            return self::VALIDATION_FAILED.': May solid food sa 0-5 months meal plan - dapat GATAS LAMANG!';
                        }
                    }
                }
            }
        }

        // Check for duplicate base foods in meal plan (12-23 months only)
        // For 6-11 months, NCS only recommends lugaw — duplicates are expected and correct
        // For 24+ months, all NCS meals use kanin as base — duplicates are expected and correct
        if ($ageInMonths >= 12 && $ageInMonths < 24) {
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

        // Check for processed foods (banned) — only in meal content, not in advisory notes
        $bannedFoods = ['Pancit Canton', 'De Lata', 'soft drinks', 'instant noodles'];
        foreach (preg_split('/\R/', $recommendation) as $line) {
            if (preg_match('/^(Umaga|Tanghali|Gabi):\s*(.*?)(?:\s*[-–—(]|$)/i', $line, $matches)) {
                $mealContent = $matches[2];
                foreach ($bannedFoods as $banned) {
                    if (stripos($mealContent, $banned) !== false) {
                        return self::VALIDATION_FAILED.': Banned food found in meal: '.$banned;
                    }
                }
            }
        }

        return true;
    }

    private function fixMealPlan(string $recommendation, int $ageInMonths): string
    {
        // Fix meals that have only light foods (prutas/gulay) without heavy food base
        $lines = explode("\n", $recommendation);
        $fixedLines = [];
        $currentSection = '';

        // Section header patterns
        $sectionHeaders = [
            '/MGA NUTRITIOUS NA TIP/i',
            '/MEAL PLAN/i',
            '/MGA VITAMIN/i',
            '/MGA RESTRICTIONS/i',
            '/DISCLAIMER/i',
            '/Pinagkuhanan/i',
            '/PAALALA/i',
        ];

        $heavyFoods = ['lugaw', 'kanin', 'kamote', 'tinapay', 'pasta', 'noodles', 'mais'];

        foreach ($lines as $line) {
            $lineTrimmed = trim($line);
            $lineLower = strtolower($line);

            // Detect section headers
            foreach ($sectionHeaders as $pattern) {
                if (preg_match($pattern, $line)) {
                    $currentSection = $pattern;
                    break;
                }
            }

            // Check if this is a meal line
            if (preg_match('/^(Umaga|Tanghali|Gabi):\s*(.+)$/i', $line, $matches)) {
                $mealTime = $matches[1];
                $mealContent = trim($matches[2]);

                // For 0-5 months, override ALL meal lines to gatas-only
                if ($ageInMonths < 6) {
                    $mealContent = 'Gatas lamang (breastmilk/formula)';
                    $line = $mealTime.': '.$mealContent;
                } else {
                    $mealContentLower = strtolower($mealContent);
                    // Check if meal has heavy food
                    $hasHeavyFood = false;
                    foreach ($heavyFoods as $heavy) {
                        if (strpos($mealContentLower, $heavy) !== false) {
                            $hasHeavyFood = true;
                            break;
                        }
                    }
                    if (! $hasHeavyFood && $ageInMonths < 12) {
                        // 6-11 months: NCS requires a carb base. Add lugaw if missing.
                        $mealContent = 'Lugaw na may '.$mealContent;
                        $line = $mealTime.': '.$mealContent;
                    }
                }
            }

            // For 0-5 months: sanitize non-meal sections
            if ($ageInMonths < 6) {
                // Skip original AI-generated tips — inject gatas-only tips after the header
                if ($currentSection === '/MGA NUTRITIOUS NA TIP/i' && preg_match('/^\d+\./', $lineTrimmed)) {
                    continue;
                }

                // Skip all lines in "MGA VITAMIN" section (no supplements for 0-5mo)
                if ($currentSection === '/MGA VITAMIN/i') {
                    continue;
                }

                // Adjust restrictions section for 0-5 months
                if ($currentSection === '/MGA RESTRICTIONS/i' && preg_match('/^- /', $lineTrimmed)) {
                    continue; // Skip original restrictions, we add our own below
                }
            }

            $fixedLines[] = $line;
        }

        // For 0-5 months: inject gatas-only tips and restrictions after their respective headers
        if ($ageInMonths < 6) {
            $result = [];
            $tipsInjected = false;
            $restrictionsInjected = false;
            foreach ($fixedLines as $line) {
                $result[] = $line;
                if (! $tipsInjected && preg_match('/MGA NUTRITIOUS NA TIP/i', $line)) {
                    $result[] = '1. Magbigay ng gatas (breastmilk o formula) 8-12 beses sa isang araw para sa tamang nutrisyon.';
                    $result[] = '2. Siguraduhing wastong posisyon ang baby habang nagpapadede.';
                    $result[] = '3. Walang kailangang tubig o ibang pagkain — sapat na ang breastmilk o formula.';
                    $result[] = '4. Regular na i-monitor ang pagtaas ng timbang at dalhin sa health center para sa check-up.';
                    $tipsInjected = true;
                }
                if (! $restrictionsInjected && preg_match('/MGA RESTRICTIONS/i', $line)) {
                    $result[] = '- WALANG solid food para sa 0-5 buwan — gatas lamang ang kailangan.';
                    $result[] = '- Iwasan ang anumang pagkain maliban sa breastmilk o formula.';
                    $result[] = '- Walang kailangang vitamins o supplements — sapat na na ang gatas.';
                    $restrictionsInjected = true;
                }
            }
            $fixedLines = $result;
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
