<?php

use App\Models\Child;
use App\Models\User;
use App\Services\IprogsmsService;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    config(['services.iprogsms.api_token' => 'test_api_token_123']);
});

describe('IPROG SMS Service', function () {
    it('normalizes 09XXXXXXXXX phone numbers to 639XXXXXXXXX format', function () {
        $service = new IprogsmsService;

        $result = $service->normalizePhoneNumber('09171234567');

        expect($result)->toBe('639171234567');
    });

    it('accepts 639XXXXXXXXX format as-is', function () {
        $service = new IprogsmsService;

        $result = $service->normalizePhoneNumber('639171234567');

        expect($result)->toBe('639171234567');
    });

    it('sends single SMS via IPROG API', function () {
        Http::fake([
            'sms.iprogtech.com/api/v1/sms_messages' => Http::response(['message' => 'SMS sent'], 200),
        ]);

        $service = new IprogsmsService;
        $result = $service->sendSms('09171234567', 'Test message');

        expect($result['success'])->toBeTrue();
        expect($result['phone'])->toBe('639171234567');
    });

    it('handles single SMS failure', function () {
        Http::fake([
            'sms.iprogtech.com/api/v1/sms_messages' => Http::response(['message' => 'Invalid token'], 401),
        ]);

        $service = new IprogsmsService;
        $result = $service->sendSms('09171234567', 'Test message');

        expect($result['success'])->toBeFalse();
        expect($result['error'])->not->toBeEmpty();
    });

    it('sends bulk SMS via IPROG bulk endpoint', function () {
        Http::fake([
            'sms.iprogtech.com/api/v1/sms_messages/send_bulk' => Http::response(['message' => 'Bulk SMS sent'], 200),
        ]);

        $service = new IprogsmsService;
        $result = $service->sendBulkSms(['09171234567', '09187654321'], 'Test message');

        expect($result['success'])->toBeTrue();
        expect($result['phones'])->toContain('639171234567');
        expect($result['phones'])->toContain('639187654321');
    });

    it('checks SMS credits successfully', function () {
        Http::fake([
            'sms.iprogtech.com/api/v1/account/sms_credits*' => Http::response(['credits' => 100], 200),
        ]);

        $service = new IprogsmsService;
        $result = $service->checkCredits();

        expect($result['success'])->toBeTrue();
        expect($result['credits'])->toBe(100);
    });

    it('returns error when credits check fails', function () {
        Http::fake([
            'sms.iprogtech.com/api/v1/account/sms_credits*' => Http::response(['message' => 'Unauthorized'], 401),
        ]);

        $service = new IprogsmsService;
        $result = $service->checkCredits();

        expect($result['success'])->toBeFalse();
    });
});

describe('SMS Controller', function () {
    beforeEach(function () {
        $admin = User::factory()->create();
        $admin->assignRole('Admin');
        $this->admin = $admin;
    });

    it('returns error when API token is missing', function () {
        config(['services.iprogsms.api_token' => null]);

        $response = $this->actingAs($this->admin)->post('/admin/sendsms', [
            'recipient_type' => 'all',
            'message' => 'Test message',
        ]);

        $response->assertSessionHas('error');
    });

    it('sends SMS to all recipients using bulk endpoint', function () {
        Http::fake([
            'sms.iprogtech.com/api/v1/sms_messages/send_bulk' => Http::response(['message' => 'Bulk SMS sent'], 200),
        ]);

        Child::factory()->create(['contact_number' => '09171234567']);
        Child::factory()->create(['contact_number' => '09187654321']);

        $response = $this->actingAs($this->admin)->post('/admin/sendsms', [
            'recipient_type' => 'all',
            'message' => 'Test message to all',
        ]);

        $response->assertSessionHas('success');
    });

    it('sends single SMS when only one recipient', function () {
        Http::fake([
            'sms.iprogtech.com/api/v1/sms_messages' => Http::response(['message' => 'SMS sent'], 200),
        ]);

        $child = Child::factory()->create(['contact_number' => '09171234567']);

        $response = $this->actingAs($this->admin)->post('/admin/sendsms', [
            'recipient_type' => 'single',
            'recipients' => [$child->id],
            'message' => 'Test single message',
        ]);

        $response->assertSessionHas('success');
    });

    it('validates required fields', function () {
        $response = $this->actingAs($this->admin)->post('/admin/sendsms', []);

        $response->assertSessionHasErrors(['recipient_type', 'message']);
    });

    it('returns error when no valid recipients found', function () {
        $response = $this->actingAs($this->admin)->post('/admin/sendsms', [
            'recipient_type' => 'all',
            'message' => 'Test message',
        ]);

        $response->assertSessionHas('error');
    });
});
