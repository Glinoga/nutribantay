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

        $body = $response->json() ?? [];

        // IPROG returns {"status": 200, "message_id": "iSms-XXX"} on success
        // and {"status": 500, "message": "Invalid Token"} or {"status": "error"} on failure
        $statusCode = $body['status'] ?? null;
        $isSuccess = $response->successful()
            && ($statusCode === 200 || $statusCode === '200')
            && isset($body['message_id']);

        return [
            'success' => $isSuccess,
            'phone' => $normalizedPhone,
            'response' => $body,
            'error' => $isSuccess ? null : $this->resolveErrorMessage($body),
        ];
    }

    /**
     * Send bulk SMS (comma-separated numbers)
     * Includes retry logic for failed numbers
     */
    public function sendBulkSms(array $phones, string $message, int $maxRetries = 2): array
    {
        $normalizedPhones = array_map([$this, 'normalizePhoneNumber'], $phones);
        $phoneString = implode(',', $normalizedPhones);

        $response = Http::asForm()->post($this->baseUrl.'/sms_messages/send_bulk', [
            'api_token' => $this->apiToken,
            'phone_number' => $phoneString,
            'message' => $message,
        ]);

        $body = $response->json() ?? [];

        // IPROG returns {"status": 200, "message_ids": "..."} on bulk success
        $statusCode = $body['status'] ?? null;
        $isSuccess = $response->successful()
            && ($statusCode === 200 || $statusCode === '200')
            && isset($body['message_ids']);

        // If bulk fails, try individual sends with retry
        if (! $isSuccess) {
            return $this->sendIndividualWithRetry($normalizedPhones, $message, $maxRetries);
        }

        return [
            'success' => true,
            'phones' => $normalizedPhones,
            'response' => $body,
            'error' => null,
            'failed_phones' => [],
        ];
    }

    /**
     * Send individual SMS with retry logic
     */
    protected function sendIndividualWithRetry(array $phones, string $message, int $maxRetries = 2): array
    {
        $sent = [];
        $failed = [];

        foreach ($phones as $phone) {
            $success = false;

            for ($attempt = 0; $attempt <= $maxRetries; $attempt++) {
                $result = $this->sendSms($phone, $message);

                if ($result['success']) {
                    $sent[] = $phone;
                    $success = true;
                    break;
                }

                if ($attempt < $maxRetries) {
                    sleep(1); // Brief pause before retry
                }
            }

            if (! $success) {
                $failed[] = $phone;
            }
        }

        return [
            'success' => count($failed) === 0,
            'phones' => $phones,
            'sent_phones' => $sent,
            'failed_phones' => $failed,
            'error' => count($failed) > 0 ? 'Some messages failed to send' : null,
        ];
    }

    /**
     * Safely coerce an API response body into a plain error string.
     * The IPROG API occasionally returns 'message' or 'error' as arrays,
     * which would cause "Array to string conversion" if concatenated directly.
     */
    private function resolveErrorMessage(array $body): string
    {
        $raw = $body['message'] ?? $body['error'] ?? 'Unknown error';

        if (is_array($raw)) {
            return json_encode($raw) ?: 'Unknown error';
        }

        return (string) $raw;
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

        // Credits endpoint uses string "success" / "error" for status (not integer)
        $isSuccess = $response->successful() && ($body['status'] ?? '') === 'success';

        return [
            'success' => $isSuccess,
            'credits' => $isSuccess ? (float) $credits : 0,
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

        $body = $response->json();

        $statusCode = $body['status'] ?? null;
        $isSuccess = $response->successful()
            && ($statusCode === 200 || $statusCode === '200' || $statusCode === 'success');

        return [
            'success' => $isSuccess,
            'response' => $body,
        ];
    }
}
