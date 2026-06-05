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

        // Step 4: Get Vitamin A and Deworming status — check if given within the last 6 months
        $lastVitaminA = $child->healthLogs()
            ->where('vitamin_a', true)
            ->latest('created_at')
            ->first();
        $vitaminAStatus = $lastVitaminA && $lastVitaminA->created_at->gt(now()->subMonths(6)) ? 'Yes' : 'No';

        $lastDeworming = $child->healthLogs()
            ->where('deworming', true)
            ->latest('created_at')
            ->first();
        $dewormingStatus = $lastDeworming && $lastDeworming->created_at->gt(now()->subMonths(6)) ? 'Yes' : 'No';

        // Compute deworming recommendation flag — only for 12+ months AND not given within 6 months
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
        $recommendation = $this->generateWithRetry($apiKey, $prompt, $totalMonths, $nutritionStatus, $child->sex, $totalMonths, $vitaminAStatus, $dewormingStatus, $child->id);

        // Step 8: Post-process to enforce age-appropriate content
        $recommendation = $this->enforceAgeSafety($recommendation, $totalMonths);

        // Step 9: Post-process to fix deworming if AI missed it
        $recommendation = $this->fixDewormingRecommendation($recommendation, $totalMonths, $dewormingStatus);

        return response()->json(['recommendation' => trim($recommendation)]);
    }

    private function getNCSGuidelinesSection(int $months): string
    {
        if ($months < 6) {
            return "0-5 BUWAN (Gatas lamang):\n- Dalas: 8-12 beses isang araw (on-demand)\n- Pagkain: Gatas lamang (breastmilk o formula) - WALANG SOLID FOOD";
        }

        if ($months === 6) {
            return "6 NA BUWAN:\n- Dalas: 2 beses isang araw\n- Pagkain: Malapot na Lugaw (2-3 kutsara)";
        }

        if ($months <= 8) {
            return "6-8 BUWAN:\n- Dalas: 2-3 beses isang araw\n- Pagkain (PUMILI NG ISA PER MEAL - HUWAG UMIULIT):\n  - Lugaw na may kalabasa (1/2 tasa)\n  - Lugaw na may malunggay (1/2 tasa)\n  - Lugaw na may pritong isda (1/2 tasa)";
        }

        if ($months <= 11) {
            return "9-11 BUWAN:\n- Dalas: 3-4 beses isang araw + 2 meryenda\n- Pagkain (PUMILI NG ISA PER MEAL - HUWAG UMIULIT):\n  - Lugaw na monggo, sayote, at saluyot (1/2 tasa)\n  - Papaya na minasa (1/2 tasa)\n  - Lugaw na may kalabasa at pritong isda (1/2 tasa)\n  - Kalabasa at repolyong sopas (1/2 tasa)";
        }

        $section = "12-23 BUWAN:\n- Dalas: 4-5 beses isang araw + 2 meryenda\n- Pagkain (PUMILI NG ISA PER MEAL - HUWAG UMIULIT):\n  - Ginisang gulay (1 tasa kanin + 1/2 tasa ulam)\n  - Hiniwang saging (1 tasa)\n  - Ginataang kadyos na may kalabasa (1 tasa kanin + 1/2 tasa ulam)\n  - Hiniwang itlog (1 tasa)\n  - Sinampalukang manok (1 tasa kanin + 1/2 tasa ulam)";

        if ($months >= 24) {
            $section .= "\n\n24+ BUWAN:\n- Dalas: 4-5 beses isang araw + 2 meryenda\n- Pagkain: Regular solid foods - sundin ang 12-23 months guidelines";
        }

        return $section;
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
        $ncsSection = $this->getNCSGuidelinesSection($months);

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

NATIONAL NUTRITION COUNCIL FEEDING GUIDELINES (STRICT - PARA SA EDAD LANG NG BATA):
====================================================================================

{$ncsSection}

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
8. **Ang Nutrition Tips ay dapat naka-angkop sa Nutrition Status ng bata** - halimbawa, kung Underweight ang bata, bigyang-diin ang iron at zinc; kung Overweight, focus sa fiber at limitahan ang asukal

OUTPUT FORMAT:
1. Mga Nutrition Tips (3-4 items, i-angkop sa Nutrition Status ng bata)
2. Meal Plan (Bawat meal ay ISA lamang - HUWAG COMBINE):
   - Umaga: [isang pagkain sa listahan]
   - Tanghali: [isang pagkain sa listahan - DI IULIT]
   - Gabi: [isang pagkain sa listahan - DI IULIT]
3. Mga Vitamin, Supplements, at Nutrients (ayon sa health assessment ng bata)
4. Food Restrictions
5. Disclaimer
6. Pinagkuhanan ng Datos: National Nutrition Council

**EXAMPLE OUTPUT PARA SA 0-5 BUWAN (i-angkop ang tips sa Nutrition Status ng bata):**
1. Mga Nutrition Tips:
   1. Magpasuso tuwing 2-3 oras o ayon sa pangangailangan ng sanggol.
   2. Ang breastmilk o formula ay sapat na pagkain at inumin — walang kailangang tubig.
   3. Dalhin sa health center para sa regular na check-up at growth monitoring.
   [Kung ang Nutrition Status ay hindi Normal, magdagdag ng karagdagang tip na angkop sa kondisyon ng bata]
2. Meal Plan:
   - Umaga: Gatas lamang (breastmilk o formula)
   - Tanghali: Gatas lamang (breastmilk o formula)
   - Gabi: Gatas lamang (breastmilk o formula)
3. Mga Vitamin, Supplements, at Nutrients: Wala — sapat na ang gatas.
4. Food Restrictions: WALANG solid food, tubig, o anumang pagkain maliban sa gatas.
5. Disclaimer: Ang rekomendasyong ito ay batay sa National Nutrition Council guidelines.
6. Pinagkuhanan ng Datos: National Nutrition Council

IMPORTANT: Huwag gamitin ang pangalan ng bata sa output. Suriin ang validity bago ilabas ang sagot. HUWAG GUMAMIT NG # (HASHTAG) SA OUTPUT.
";
    }

    private function generateWithRetry(string $apiKey, string $prompt, int $totalMonths, string $nutritionStatus, string $sex, int $months, string $vitaminAStatus, string $dewormingStatus, int $childId): string
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

            return $this->getLocalFallback($nutritionStatus, $sex, $months, $vitaminAStatus, $dewormingStatus, $childId);
        }

        \Log::error("AI recommendation failed after {$attempts} attempts with no valid response. Error: {$lastError}");

        return $this->getLocalFallback($nutritionStatus, $sex, $months, $vitaminAStatus, $dewormingStatus, $childId);
    }

    private function getLocalFallback(string $status, string $sex, int $ageInMonths, ?string $vitaminA = null, ?string $deworming = null, int $childId = 0): string
    {
        return AIRecommender::getRecommendation(
            $status,
            $sex,
            $ageInMonths,
            $vitaminA,
            $deworming,
            $childId
        );
    }

    private function validateRecommendation(string $recommendation, int $ageInMonths = 0): true|string
    {
        // For 0-5 months, check that meal plan has gatas-only meal lines
        if ($ageInMonths < 6) {
            $solidFoods = ['lugaw', 'kanin', 'kamote', 'tinapay', 'pasta', 'noodles', 'mais', 'itlog', 'karne', 'isda', 'manok', 'gulay', 'prutas'];
            $hasMealLine = false;
            foreach (preg_split('/\R/', $recommendation) as $line) {
                if (preg_match('/^(Umaga|Tanghali|Gabi):/i', $line)) {
                    $hasMealLine = true;
                    $lineLower = strtolower($line);
                    foreach ($solidFoods as $food) {
                        if (strpos($lineLower, $food) !== false) {
                            return self::VALIDATION_FAILED.': May solid food sa 0-5 months meal plan - dapat GATAS LAMANG!';
                        }
                    }
                }
            }
            if (! $hasMealLine) {
                return self::VALIDATION_FAILED.': Walang meal lines sa 0-5 months - dapat may GATAS LAMANG!';
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

    private function enforceAgeSafety(string $recommendation, int $ageInMonths): string
    {
        $lines = explode("\n", $recommendation);
        $fixed = [];

        if ($ageInMonths < 6) {
            $suppressing = false;

            foreach ($lines as $line) {
                if ($suppressing) {
                    if (preg_match('/^4\.\s/', trim($line)) || preg_match('/^#{0,2}\s*Food Restrictions/i', trim($line)) || preg_match('/^(4\.|Food Restrictions)/i', trim($line))) {
                        $suppressing = false;
                    } else {
                        continue;
                    }
                }

                if (preg_match('/^3\.\s*Mga Vitamin/i', trim($line)) || preg_match('/^#{0,2}\s*Mga Vitamin/i', trim($line))) {
                    $suppressing = true;

                    continue;
                }

                if (preg_match('/^(Umaga|Tanghali|Gabi):/i', $line)) {
                    $fixed[] = trim(preg_replace('/^(Umaga|Tanghali|Gabi):.*$/i', '$1: Gatas lamang (breastmilk/formula)', $line));

                    continue;
                }

                $fixed[] = $line;
            }

            return implode("\n", $fixed);
        }

        if ($ageInMonths >= 6 && $ageInMonths < 12) {
            $heavyFoods = ['lugaw', 'kanin', 'kamote', 'tinapay', 'pasta', 'noodles', 'mais'];
            foreach ($lines as $line) {
                if (preg_match('/^(Umaga|Tanghali|Gabi):\s*(.+)$/i', $line, $m)) {
                    $content = strtolower(trim($m[2]));
                    $hasHeavy = false;
                    foreach ($heavyFoods as $h) {
                        if (str_contains($content, $h)) {
                            $hasHeavy = true;
                            break;
                        }
                    }
                    if (! $hasHeavy) {
                        $line = $m[1].': Lugaw na may '.trim($m[2]);
                    }
                }
                $fixed[] = $line;
            }

            return implode("\n", $fixed);
        }

        return $recommendation;
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
