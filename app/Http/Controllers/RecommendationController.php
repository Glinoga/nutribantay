<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class RecommendationController extends Controller
{
    public function generate(Request $request)
    {
        $apiKey = config('openai.api_key');

        $response = Http::withHeaders([
            'Authorization' => "Bearer {$apiKey}",
            'Content-Type' => 'application/json',
        ])->post('https://api.openai.com/v1/chat/completions', [
            'model' => 'gpt-4o-mini', // or 'gpt-3.5-turbo' if you prefer
            'messages' => [
                ['role' => 'system', 'content' => 'You are a helpful AI health assistant.'],
                ['role' => 'user', 'content' => "Provide a simple nutrition recommendation for a child with BMI {$request->bmi} and status {$request->nutrition_status}."],
            ],
            'max_tokens' => 200,
        ]);

        return response()->json([
            'recommendation' => $response->json('choices.0.message.content') ?? 'No response from AI.',
        ]);
    }
}
