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

        // ✅ Step 1: Fetch child details
        $child = Child::find($request->child_id);

        if (!$child) {
            return response()->json(['recommendation' => '❌ Child not found.']);
        }

        // ✅ Step 2: Calculate age in months and days
        $ageInDays = Carbon::parse($child->birthdate)->diffInDays(Carbon::now());
        $months = floor($ageInDays / 30.44);
        $days = $ageInDays % 30;

        // ✅ Step 3: Fetch available stocks for the child's barangay
        $stocks = Stock::where('barangay', $child->barangay)->get(['item_name']);

        $stockList = $stocks->isEmpty()
    ? 'No available health supplies in the barangay.'
    : $stocks->map(fn($s) => "{$s->item_name}")->join(', ');

        // ✅ Step 4: Prepare AI prompt
        $prompt = "
            Ikaw ay isang AI assistant para sa mga barangay health workers sa Pilipinas. Layunin mo ay magbigay ng **praktikal, abot-kaya, at madaling gawin na rekomendasyon** para sa bata mula sa pamilyang may limitadong budget. Gamitin ang casual, normal na Tagalog na madaling maintindihan ng karaniwang magulang. Huwag lalampas sa 400 tokens. Huwag putulin ang mga pangungusap. Tapusin ang bawat ideya nang buo at malinaw. Ibigay ang sagot bilang 5–6 malinaw at kumpletong puntos, bawat isa ay kumpleto ang pangungusap.

            IMPORMASYON NG BATA:
            - Edad: {$months} buwan at {$days} araw
            - Kasarian: {$child->sex}
            - BMI: {$request->bmi}
            - Nutrition Status: {$request->nutrition_status}
            - Barangay: {$child->barangay}
            - Available health supplies: {$stockList}

            GABAY:
            1. Batay sa BMI at nutrition status, magbigay ng simple at direktang payo kung kulang sa timbang, normal, o sobra sa timbang.
            2. Magbigay ng **unique at realistic na ideya** na maaaring hindi agad maiisip ng healthworker.
            3. Isama ang **dietary, lifestyle, o local resource-based solutions** gamit ang murang, lokal na pagkain o resources.
            4. Magbigay ng maliit na hacks o tips na puwede sa bahay.
            5. Gamitin ang **available barangay stocks** sa rekomendasyon, kung posible.
            6. Sagutin nang malinaw, madaling maintindihan, at casual ang tono.
            ";


        // ✅ Step 5: Send to GPT
        $response = Http::withHeaders([
            'Authorization' => "Bearer {$apiKey}",
            'Content-Type' => 'application/json',
        ])->post('https://api.openai.com/v1/chat/completions', [
            'model' => 'gpt-4o-mini',
            'messages' => [
                ['role' => 'system', 'content' => 'Ikaw ay isang AI nutrition assistant para sa mga barangay health workers sa Pilipinas. Sagutin sa casual, madaling maintindihan na Tagalog.'],
                ['role' => 'user', 'content' => $prompt],
            ],
            'max_tokens' => 600,
        ]);

        $aiMessage = $response->json('choices.0.message.content') ?? '⚠️ No response from AI.';

        return response()->json([
            'recommendation' => trim($aiMessage),
        ]);
    }
}
