<?php

namespace App\Http\Controllers;

use App\Models\Child;
use App\Services\IprogsmsService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SMSController extends Controller
{
    protected IprogsmsService $smsService;

    public function __construct()
    {
        $this->smsService = new IprogsmsService;
    }

    public function index()
    {
        $user = auth()->user();

        // Get all children with contact numbers - Healthworkers limited to their barangay
        $query = Child::select('id', 'first_name', 'middle_initial', 'last_name', 'contact_number')
            ->whereNotNull('contact_number')
            ->where('contact_number', '!=', '');

        // Healthworkers can only see children in their barangay
        if ($user->hasRole('Healthworker') && ! $user->hasRole('Admin')) {
            $query->where('barangay', $user->barangay);
        }

        $children = $query->get()
            ->map(function ($child) {
                $fullname = trim($child->first_name.' '.($child->middle_initial ? $child->middle_initial.' ' : '').$child->last_name);

                return [
                    'id' => $child->id,
                    'name' => $fullname.' (Child)',
                    'phone' => $child->contact_number,
                ];
            });

        // Get SMS credits
        $credits = 0;
        try {
            $creditsResult = $this->smsService->checkCredits();
            if ($creditsResult['success']) {
                $credits = $creditsResult['credits'];
            }
        } catch (\Exception $e) {
            \Log::warning('Could not fetch SMS credits: '.$e->getMessage());
        }

        return Inertia::render('SMS/index', [
            'users' => $children,
            'credits' => $credits,
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
            $apiToken = config('services.iprogsms.api_token');

            if (! $apiToken) {
                return back()->with('error', 'IPROG SMS configuration is missing. Please check your .env file for IPROGSMS_API_TOKEN.');
            }

            $user = auth()->user();
            $phones = [];

            if ($validated['recipient_type'] === 'all') {
                $query = Child::whereNotNull('contact_number')
                    ->where('contact_number', '!=', '');

                // Healthworkers can only send to their barangay
                if ($user->hasRole('Healthworker') && ! $user->hasRole('Admin')) {
                    $query->where('barangay', $user->barangay);
                }

                $phones = $query->pluck('contact_number')
                    ->toArray();
            } else {
                $query = Child::whereIn('id', $validated['recipients'])
                    ->whereNotNull('contact_number')
                    ->where('contact_number', '!=', '');

                // Healthworkers can only send to their barangay
                if ($user->hasRole('Healthworker') && ! $user->hasRole('Admin')) {
                    $query->where('barangay', $user->barangay);
                }

                $phones = $query->pluck('contact_number')
                    ->toArray();
            }

            if (empty($phones)) {
                return back()->with('error', 'No valid phone numbers found for the selected recipients.');
            }

            // Remove duplicates and reindex
            $phones = array_values(array_unique($phones));

            $sentCount = 0;
            $failedCount = 0;
            $errors = [];
            $failedPhones = [];

            // Use bulk endpoint for multiple recipients, single for one
            if (count($phones) === 1) {
                $result = $this->smsService->sendSms($phones[0], $validated['message']);
                if ($result['success']) {
                    $sentCount++;
                    \Log::info("SMS sent successfully to {$phones[0]}");
                } else {
                    $failedCount++;
                    $failedPhones[] = $phones[0];
                    $errors[] = "Failed to send to {$phones[0]}: ".($result['error'] ?? 'Unknown error');
                    \Log::error("Failed to send SMS to {$phones[0]}: ".($result['error'] ?? 'Unknown error'));
                }
            } else {
                $result = $this->smsService->sendBulkSms($phones, $validated['message']);

                if (isset($result['sent_phones']) && isset($result['failed_phones'])) {
                    // New structured response with individual results
                    $sentCount = count($result['sent_phones']);
                    $failedCount = count($result['failed_phones']);
                    $failedPhones = $result['failed_phones'];

                    if ($failedCount > 0) {
                        $errors[] = 'Some messages failed to send.';
                    }
                } elseif ($result['success']) {
                    $sentCount = count($phones);
                    \Log::info('Bulk SMS sent successfully to '.count($phones).' recipients');
                } else {
                    $failedCount = count($phones);
                    $failedPhones = $phones;
                    $errors[] = 'Bulk SMS failed: '.($result['error'] ?? 'Unknown error');
                    \Log::error('Bulk SMS failed: '.($result['error'] ?? 'Unknown error'));
                }
            }

            if ($sentCount > 0 && $failedCount === 0) {
                return back()->with('success', "SMS sent successfully to {$sentCount} recipient(s)!");
            } elseif ($sentCount > 0 && $failedCount > 0) {
                $failedPhonesStr = implode(', ', array_slice($failedPhones, 0, 5));
                $extra = count($failedPhones) > 5 ? ' and '.(count($failedPhones) - 5).' more' : '';
                return back()->with('warning', "SMS sent to {$sentCount} recipient(s), but failed for {$failedCount}: {$failedPhonesStr}{$extra}");
            } else {
                return back()->with('error', 'Failed to send SMS to all recipients. Errors: '.implode(', ', $errors));
            }

        } catch (\Exception $e) {
            \Log::error('SMS Controller Error: '.$e->getMessage());

            return back()->with('error', 'Error sending SMS: '.$e->getMessage());
        }
    }
}
