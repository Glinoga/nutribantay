<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\Child;
use App\Models\Stock;
use Carbon\Carbon;

class RecommendationController extends Controller
{
    public function generate(Request $request)
    {
        $apiKey = config('openai.api_key');

        // Step 1: Fetch child
        $child = Child::find($request->child_id);

        if (!$child || !$child->birthdate) {
            return response()->json(['recommendation' => '❌ Child data incomplete.']);
        }

        // Step 2: Calculate age in months and days
        $birthdate = Carbon::parse($child->birthdate);
$now = Carbon::now();

// Calculate exact difference in years, months, and days
$birthdate = Carbon::parse($child->birthdate);
$now = Carbon::now();

// Exact difference in years, months, and days
$years = $birthdate->diffInYears($now);
$months = $birthdate->copy()->addYears($years)->diffInMonths($now);
$days = $birthdate->copy()->addYears($years)->addMonths($months)->diffInDays($now);

// Human-readable format for AI prompt
$ageFormatted = "{$years} year(s), {$months} month(s), and {$days} day(s)";



        // Step 3: BMI and nutrition status defaults
        $bmiText = $request->bmi ?? 'Hindi available';
        $nutritionStatus = $request->nutrition_status ?? 'Normal';

        // Step 4: Fetch stocks for the child’s barangay
        // Fetch stocks for the child’s barangay
$stocks = Stock::where('barangay', $child->barangay)->get(['item_name']);
$stockList = $stocks->isEmpty()
    ? 'Walang available health supplies sa barangay.'
    : $stocks->pluck('item_name')->join(', ');

        // Step 6: AI prompt with strict instructions
        $prompt = "
Ikaw ay isang AI nutrition assistant para sa mga barangay health workers sa Pilipinas.
Sagutin sa casual at madaling maintindihan na Tagalog. Huwag lalampas sa 500 tokens.
Magbigay ng 5 nutrition-based tips para sa bata, pagkatapos ay magbigay ng simpleng meal plan para sa isang araw. 
Gamitin ang mga available health supplies sa barangay para sa practical na payo. 
Ilagay ang food restrictions o allergy warnings sa dulo. Huwag mag-imbento o manghula; gamitin lamang ang ibinigay na detalye.

FEEDING RULES (STRICT – Huwag lalampas sa output):
- 0–5 months: Gatas lamang (exclusive breastfeeding). Huwag magbigay ng solid food o complementary feeding.
- 6–11 months: Breastfeeding + complementary feeding (malalambot na pagkain) puwede.
- 12 months pataas: Regular solid foods na angkop sa edad.
PAALALA: Huwag gamitin ang terminolohiyang “Milk Formula” o “Formula Milk.”

IMPORMASYON NG BATA (Siguraduhing isang beses lang ito lalabas):
- Edad: {$ageFormatted}
- Petsa ng kapanganakan: {$child->birthdate}
- Kasarian: {$child->sex}
- Available health supplies sa barangay: {$stockList}

INSTRUCTIONS:
1. Magbigay ng 3–4 malinaw, maiksi, at praktikal na nutrition tips batay sa edad, BMI, at nutrition status.
2. Sundin ang tamang feeding rules base sa edad ng bata. 
   - Kung bata ay 0–5 months, ang meal plan ay **gatas lamang**. Huwag magbigay ng anumang solid food o complementary feeding.
   - Kung bata ay 6–11 months, puwede nang magdagdag ng malalambot na pagkain (lugaw, mashed fruits/vegetables) kasama ng breastfeeding.
   - Kung bata ay 12 months pataas, puwede na ang regular solid foods na angkop sa edad.
3. Gumawa ng **simpleng meal plan para sa isang araw** sa **linear format** (hal. *Umaga: …, Tanghali: …, Gabi: …*). **Huwag gamitin ang pangalan ng bata** sa meal plan.

**Validity Conditions — kailangang pumasa ang output sa LAHAT ng ito**

* **Eksaktong tatlong magkaibang meal entries lamang** ang dapat lumabas (Umaga, Tanghali, Gabi)
* **Walang base food o pangunahing ulam ang maaaring maulit**

  * Ang **base food** ay ang pangunahing putahe o starch (hal. lugaw, kanin, kamote, mais, tinapay)
  * Ang pagdagdag ng itlog, gulay, o prutas **HINDI** nagpapabago ng base food
* Kung may **kahit isang base food na naulit**, **INVALID ang output at kailangang muling buuin**

**Food Eligibility Rules**

* **Magrekomenda lamang ng pagkaing akma sa edad, BMI, nutrition status, at feeding rules ng bata**
* **Ipinagbabawal ang processed at high-sodium foods**, kabilang ngunit hindi limitado sa:

  * instant noodles / Pancit Canton
  * de-lata
  * soft drinks
  * instant o packaged snacks
* Kung ang pagkain ay **hindi akma sa feeding rules**, **HINDI ito maaaring irekomenda**, kahit available sa barangay

**Light vs Heavy Food Rule**

* Ang **light o small foods** (hal. prutas, simpleng gulay, sabaw lamang) ay **HINDI maaaring tumayo mag-isa bilang isang meal**
* Maaari lamang silang isama **kasama ng isang heavy o filling base food**
* Bawat meal ay dapat may **isang malinaw na heavy o filling base food**

**Barangay Food Rule**

* Suriin ang food supplies na available sa barangay
* **Isama lamang ang barangay food kung PASOK sa BMI, nutrition status, at feeding rules**
* **Huwag magrekomenda ng barangay food kung hindi ito akma**, kahit may stock

**Feasibility Rule**

* Lahat ng pagkain ay dapat **simple, pang-bahay, at kayang ihanda ng low-income na pamilya**

**Fallback Rule**

* Kung **walang angkop na pagkain mula sa barangay**, magbigay ng **general meal plan** na naaayon sa nutrition status at feeding rules

**Hard Enforcement**

* **Bago ilabas ang sagot, suriin kung pasado sa lahat ng Validity Conditions**
* Kung may kahit isang violation, **i-discard ang sagot at bumuo ng panibago**



4. Isama ang anumang vitamins o milk na available sa barangay kung akma.
5. Ilagay ang food restrictions o allergy warnings sa dulo.
6. Sagutin sa Tagalog at plain text lamang. Walang HTML, walang bold, walang **.
7. Tapusin ang sagot sa disclaimer na ito:
   Kumunsulta sa pinakamalapit na health center sa lugar nila upang ma-counsel kayo ng isang nutrition/health worker.
8. Pagkatapos ng disclaimer, ilahad muli ang mga detalye ng bata para sa reference. Ang edad ay dapat walang decimal point. Kung ang edad ay nakadepende sa buwan, ilagay kung ilang buwan na ang bata.
9. Pagkatapos ng disclaimer, maglagay ng maikling ‘Pinaghugutan ng Datos’ section. Maglagay ng sources na pinagkuhanan mo ng datos.

FORMAT:
- Gumamit ng line breaks sa pagitan ng sections.
- Tips dapat naka numbered list.
- Meal plan dapat naka linear (Umaga: ..., Tanghali: ..., Gabi: ...).
- Food restrictions sa dulo bago ang disclaimer.
";





        // Step 7: Send to AI
        $response = Http::withHeaders([
            'Authorization' => "Bearer {$apiKey}",
            'Content-Type' => 'application/json',
        ])->post('https://api.openai.com/v1/chat/completions', [
            'model' => 'gpt-4o-mini',
            'messages' => [
                ['role' => 'system', 'content' => 'Ikaw ay isang AI nutrition assistant.'],
                ['role' => 'user', 'content' => $prompt],
            ],
            'max_tokens' => 500,
            'temperature' => 0.7,
        ]);

        // Step 8: Fallback if AI fails
        if (!$response->successful()) {
            \Log::error('AI request failed', ['response' => $response->body()]);
            $recommendation = \App\Helpers\AIRecommender::getRecommendation(
                $nutritionStatus,
                $child->sex,
                $months,
                $request->bmi ?? 0
            );
        } else {
            $recommendation = $response->json('choices.0.message.content') ?? 
                              \App\Helpers\AIRecommender::getRecommendation(
                                  $nutritionStatus,
                                  $child->sex,
                                  $months,
                                  $request->bmi ?? 0
                              );
        }

        return response()->json(['recommendation' => trim($recommendation)]);
    }
}
