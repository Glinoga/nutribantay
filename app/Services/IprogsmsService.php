<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class IprogsmsService
{
    protected string $baseUrl = 'https://sms.iprogtech.com/api/v1';

    protected ?string $apiToken;

    public function __construct()
    {
        $this->apiToken = config('services.iprogsms.api_token');
    }

    /**
     * Normalize phone number to 639XXXXXXXXX format
     */
    public function normalizePhoneNumber(string $phone): string
    {
        $digits = preg_replace('/\D/', '', $phone);

        if (preg_match('/^09\d{9}$/', $digits)) {
            return '63'.substr($digits, 1);
        }

        if (preg_match('/^63\d{10}$/', $digits)) {
            return $digits;
        }

        if (preg_match('/^\d{10}$/', $digits)) {
            return '63'.$digits;
        }

        return $digits;
    }

    /**
     * Send single SMS
     */
    public function sendSms(string $phone, string $message): array
    {
        $normalizedPhone = $this->normalizePhoneNumber($phone);

        $response = Http::asForm()->post($this->baseUrl.'/sms_messages', [
            'api_token' => $this->apiToken,
            'phone_number' => $normalizedPhone,
            'message' => $message,
        ]);

        $body = $response->json();

        return [
            'success' => $response->successful(),
            'phone' => $normalizedPhone,
            'response' => $body,
            'error' => $response->successful() ? null : ($body['message'] ?? 'Unknown error'),
        ];
    }

    /**
     * Send bulk SMS (comma-separated numbers)
     */
    public function sendBulkSms(array $phones, string $message): array
    {
        $normalizedPhones = array_map([$this, 'normalizePhoneNumber'], $phones);
        $phoneString = implode(',', $normalizedPhones);

        $response = Http::asForm()->post($this->baseUrl.'/sms_messages/send_bulk', [
            'api_token' => $this->apiToken,
            'phone_number' => $phoneString,
            'message' => $message,
        ]);

        $body = $response->json();

        return [
            'success' => $response->successful(),
            'phones' => $normalizedPhones,
            'response' => $body,
            'error' => $response->successful() ? null : ($body['message'] ?? 'Unknown error'),
        ];
    }

    /**
     * Check remaining SMS credits
     */
    public function checkCredits(): array
    {
        $response = Http::get($this->baseUrl.'/account/sms_credits', [
            'api_token' => $this->apiToken,
        ]);

        $body = $response->json();

        // IPROG returns: {"status": "success", "data": {"load_balance": 5.0}}
        $credits = $body['data']['load_balance'] ?? $body['credits'] ?? $body['balance'] ?? 0;

        return [
            'success' => $response->successful(),
            'credits' => (int) $credits,
            'response' => $body,
        ];
    }

    /**
     * Check SMS delivery status
     */
    public function checkStatus(string $messageId): array
    {
        $response = Http::get($this->baseUrl.'/sms_messages/status', [
            'api_token' => $this->apiToken,
            'message_id' => $messageId,
        ]);

        return [
            'success' => $response->successful(),
            'response' => $response->json(),
        ];
    }
}
