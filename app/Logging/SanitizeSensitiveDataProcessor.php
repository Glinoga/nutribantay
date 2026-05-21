<?php

namespace App\Logging;

use Monolog\LogRecord;

class SanitizeSensitiveDataProcessor
{
    /**
     * Keys whose values should be redacted in log context.
     */
    protected array $sensitiveKeys = [
        'password',
        'password_confirmation',
        'secret',
        'token',
        'api_key',
        'api_token',
        'access_token',
        'refresh_token',
        'auth_token',
        'credit_card',
        'cvv',
        'ssn',
    ];

    /**
     * @param  array<string, mixed>  $record
     * @return array<string, mixed>
     */
    public function __invoke(LogRecord $record): LogRecord
    {
        if (isset($record->context) && is_array($record->context)) {
            $record->context = $this->sanitize($record->context);
        }

        if (isset($record->extra) && is_array($record->extra)) {
            $record->extra = $this->sanitize($record->extra);
        }

        return $record;
    }

    protected function sanitize(array $data): array
    {
        foreach ($data as $key => $value) {
            if ($this->isSensitive($key)) {
                $data[$key] = '[REDACTED]';
            } elseif (is_array($value)) {
                $data[$key] = $this->sanitize($value);
            }
        }

        return $data;
    }

    protected function isSensitive(string $key): bool
    {
        $lower = strtolower($key);

        foreach ($this->sensitiveKeys as $sensitive) {
            if (str_contains($lower, $sensitive)) {
                return true;
            }
        }

        return false;
    }
}
