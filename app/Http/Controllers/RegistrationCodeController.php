<?php

namespace App\Http\Controllers;

use App\Models\RegistrationCode;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class RegistrationCodeController extends Controller
{
    public function generate(Request $request)
    {
        // Require authentication
        $admin = auth()->user();

        $count = $request->input('count', 1);
        $adminBarangay = $admin->barangay;
        $codes = [];

        for ($i = 0; $i < $count; $i++) {
            $code = strtoupper(Str::random(8));

            $registrationCode = RegistrationCode::create([
                'code' => $code,
                'expires_at' => now()->addDay(),
                'barangay' => $adminBarangay,
            ]);

            $codes[] = [
                'code' => $registrationCode->code,
                'expires_at' => $registrationCode->expires_at,
                'barangay' => $adminBarangay,
            ];
        }

        return response()->json([
            'codes' => $codes,
        ]);
    }

    public function latest()
    {
        $adminBarangay = auth()->user()->barangay;

        $registrationCode = RegistrationCode::where('barangay', $adminBarangay)->latest()->first();

        return response()->json([
            'code' => $registrationCode?->code,
            'expires_at' => $registrationCode?->expires_at,
            'barangay' => $registrationCode?->barangay,
        ]);
    }

    public function index(Request $request)
    {
        try {
            $admin = auth()->user();

            if (! $admin) {
                return response()->json(['error' => 'Not authenticated'], 401);
            }

            if (! $admin->hasRole('Admin')) {
                return response()->json(['error' => 'Not authorized'], 403);
            }

            $adminBarangay = $admin->barangay;

            $query = RegistrationCode::where('barangay', $adminBarangay)
                ->orderBy('created_at', 'desc');

            if ($search = $request->input('search')) {
                $query->where('code', 'like', "%{$search}%");
            }

            $codes = $query->get()->map(function ($code) {
                $isUsed = $code->is_used;
                $expiresAt = $code->expires_at ? Carbon::parse($code->expires_at) : null;
                $isExpired = $expiresAt && $expiresAt->isPast();
                $status = $isUsed ? 'used' : ($isExpired ? 'expired' : 'active');

                return [
                    'id' => $code->id,
                    'code' => $code->code,
                    'barangay' => $code->barangay,
                    'expires_at' => $expiresAt?->toIso8601String(),
                    'is_used' => $isUsed,
                    'status' => $status,
                    'created_at' => $code->created_at->toIso8601String(),
                ];
            });

            return response()->json([
                'codes' => $codes,
                'debug' => [
                    'barangay' => $adminBarangay,
                    'count' => $codes->count(),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Registration code listing failed: '.$e->getMessage(), [
                'exception' => $e,
                'user_id' => auth()->id(),
            ]);

            return response()->json([
                'error' => 'An error occurred while fetching registration codes.',
            ], 500);
        }
    }

    public function destroy(string $id)
    {
        $adminBarangay = auth()->user()->barangay;

        $code = RegistrationCode::where('id', $id)
            ->where('barangay', $adminBarangay)
            ->first();

        if (! $code) {
            return response()->json([
                'success' => false,
                'message' => 'Code not found.',
            ], 404);
        }

        // Don't allow deleting active codes (can only delete used/expired)
        if (! $code->is_used && $code->expires_at && ! $code->expires_at->isPast()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete active codes.',
            ], 400);
        }

        $code->delete();

        return response()->json([
            'success' => true,
            'message' => 'Code deleted successfully.',
        ]);
    }
}
