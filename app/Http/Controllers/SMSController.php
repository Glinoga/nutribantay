<?php

namespace App\Http\Controllers;

use App\Models\Child;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Twilio\Rest\Client;

class SMSController extends Controller
{
    public function index()
    {
        // Get all children with contact numbers (caregiver/parent numbers) for the recipient list
        $children = Child::select('id', 'first_name', 'middle_initial', 'last_name', 'contact_number')
            ->whereNotNull('contact_number')
            ->where('contact_number', '!=', '')
            ->where('contact_number', '!=', '0')
            ->get()
            ->map(function ($child) {
                $mi = $child->middle_initial ? strtoupper($child->middle_initial).'.' : '';
                $fullName = trim("{$child->first_name} {$mi} {$child->last_name}");

                return [
                    'id' => $child->id,
                    'name' => $fullName,
                    'phone' => $child->contact_number,
                ];
            });

        return Inertia::render('SMS/index', [
            'users' => $children,
        ]);
    }

    public function send(Request $request)
    {
        $validated = $request->validate([
            'recipient_type' => 'required|in:single,multiple,all',
            'recipients' => 'required_if:recipient_type,single,multiple|array',
            'recipients.*' => 'exists:children,id',
            'message' => 'required|string|max:1600',
        ]);

        try {
            $sid = config('services.twilio.sid');
            $token = config('services.twilio.token');
            $from = config('services.twilio.phone_number');

            if (! $sid || ! $token || ! $from) {
                return back()->with('error', 'Twilio configuration is missing. Please check your .env file for TWILIO_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER.');
            }

            $client = new Client($sid, $token);

            $recipients = [];
            if ($validated['recipient_type'] === 'all') {
                $childRecords = Child::whereNotNull('contact_number')
                    ->where('contact_number', '!=', '')
                    ->where('contact_number', '!=', '0')
                    ->get();
            } else {
                $childRecords = Child::whereIn('id', $validated['recipients'])
                    ->whereNotNull('contact_number')
                    ->where('contact_number', '!=', '')
                    ->where('contact_number', '!=', '0')
                    ->get();
            }

            // Build array with fullname as key for logging
            foreach ($childRecords as $child) {
                $mi = $child->middle_initial ? strtoupper($child->middle_initial).'.' : '';
                $fullName = trim("{$child->first_name} {$mi} {$child->last_name}");
                $recipients[$fullName] = $child->contact_number;
            }

            if (empty($recipients)) {
                return back()->with('error', 'No valid phone numbers found for the selected recipients.');
            }

            $sentCount = 0;
            $failedCount = 0;
            $errors = [];

            foreach ($recipients as $name => $phone) {
                try {
                    // Clean phone number: remove spaces and ensure proper format for Twilio
                    $cleanPhone = str_replace(' ', '', $phone);

                    // Log the attempt for debugging
                    \Log::info("Attempting to send SMS to {$name} at {$cleanPhone}");

                    $message = $client->messages->create($cleanPhone, [
                        'from' => $from,
                        'body' => $validated['message'],
                    ]);

                    // Log success
                    \Log::info("SMS sent successfully to {$cleanPhone}. Message SID: {$message->sid}");

                    $sentCount++;
                } catch (\Exception $e) {
                    $failedCount++;
                    $errorMsg = $e->getMessage();
                    $errors[] = "Failed to send to {$name}'s guardian ({$phone}): {$errorMsg}";

                    // Log the error
                    \Log::error("Failed to send SMS to {$phone}: {$errorMsg}");
                }
            }

            if ($sentCount > 0 && $failedCount === 0) {
                return back()->with('success', "SMS sent successfully to {$sentCount} recipient(s)!");
            } elseif ($sentCount > 0 && $failedCount > 0) {
                return back()->with('warning', "SMS sent to {$sentCount} recipient(s), but failed for {$failedCount}. Errors: ".implode(', ', $errors));
            } else {
                return back()->with('error', 'Failed to send SMS to all recipients. Errors: '.implode(', ', $errors));
            }

        } catch (\Exception $e) {
            \Log::error('SMS Controller Error: '.$e->getMessage());

            return back()->with('error', 'Error sending SMS: '.$e->getMessage());
        }
    }

    // Legacy method - keeping for backward compatibility
    public function sendsms()
    {
        return redirect()->route('sms.index');
    }
}
