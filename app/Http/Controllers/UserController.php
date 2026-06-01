<?php

namespace App\Http\Controllers;

use App\Models\RegistrationCode;
use App\Models\User;
use Hash;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = auth()->user();

        if (! $user) {
            return redirect('/login');
        }

        $query = User::with('roles');

        // Admin and Healthworker restricted to own barangay for security
        $query->where('barangay', $user->barangay);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('id', $search)
                    ->orWhere('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhereHas('roles', function ($roleQuery) use ($search) {
                        $roleQuery->where('name', 'like', "%{$search}%");
                    });
            });
        }

        $users = $query->get();

        return Inertia::render('Users/Index', [
            'users' => $users->map(fn ($u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'roles' => $u->getRoleNames()->toArray(),
                'status' => $u->status,
                'registration_code' => $u->registrationCode?->code,
            ]),
            'filters' => $request->only('search'),
        ]);
    }

    public function archived()
    {
        $user = auth()->user();

        // Admin-only check (defense-in-depth, middleware should handle this)
        if (! $user->hasRole('Admin')) {
            abort(403);
        }

        $archivedUsers = User::onlyTrashed()->get();

        return Inertia::render('Users/Archived', [
            'users' => $archivedUsers,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Users/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'email' => 'nullable|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:10',
            'role' => 'required|string|exists:roles,name',
        ]);

        $user = auth()->user();

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'barangay' => $user->barangay, // Inherit barangay from authenticated user
        ]);

        $user->assignRole($request->role);

        return redirect()->route('users.index')
            ->with('success', 'User created successfully!');
    }

    public function storeBulk(Request $request)
    {
        // Validate name and password only (email now optional)
        $request->validate([
            'name' => 'required|string|max:255',
            'password' => 'required|string|min:10',
            'role' => 'required|string|exists:roles,name',
        ]);

        $admin = auth()->user();
        $barangay = $admin->barangay;

        // Check for duplicate email before transaction
        $email = $request->input('email');
        if ($email && User::where('email', $email)->exists()) {
            return response()->json(['message' => 'Email already exists'], 422);
        }

        $result = DB::transaction(function () use ($request, $barangay, $email) {
            $userData = [
                'name' => $request->name,
                'email' => $email,
                'password' => Hash::make($request->password),
                'barangay' => $barangay,
                'status' => 'approved',
            ];

            if ($email) {
                // With email: no registration code needed
                $newUser = User::create($userData);
                $newUser->assignRole($request->role);

                return [
                    'code' => null,
                    'password' => $request->password,
                ];
            }

            // Without email: generate registration code
            $code = strtoupper(Str::random(8));
            $registrationCode = RegistrationCode::create([
                'code' => $code,
                'barangay' => $barangay,
                'is_used' => true,
            ]);

            $userData['registration_code_id'] = $registrationCode->id;
            $newUser = User::create($userData);

            $newUser->assignRole($request->role);

            return [
                'code' => $code,
                'password' => $request->password,
            ];
        });

        return response()->json([
            'message' => 'User created successfully',
            'code' => $result['code'],
            'password' => $result['password'],
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $user = User::where('barangay', auth()->user()->barangay)->findOrFail($id);

        return Inertia::render('Users/Show', [
            'user' => $user,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $user = User::where('barangay', auth()->user()->barangay)->find($id);

        return Inertia::render('Users/Edit', [
            'user' => $user,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $request->validate([
            'name' => 'required',
            'email' => 'nullable',
            'password' => 'nullable|string|min:10',
            'role' => 'required|string|exists:roles,name',
        ]);

        $user = auth()->user();
        $targetUser = User::findOrFail($id);

        // Prevent admin from editing users in different barangays (loose comparison for type safety)
        if ((string) $targetUser->barangay !== (string) $user->barangay) {
            abort(403, 'You cannot edit users from other barangays.');
        }

        // Validate role exists in database
        if (! Role::where('name', $request->role)->exists()) {
            return back()->withErrors(['role' => 'Invalid role selected.']);
        }

        $targetUser->name = $request->name;

        if ($request->filled('password')) {
            $targetUser->password = Hash::make($request->password);
        }

        $targetUser->save();

        // Assign role with Spatie
        $targetUser->syncRoles([$request->role]);

        return to_route('users.index');
    }

    /**
     * Remove the specified resource from storage (soft delete).
     */
    public function destroy(string $id)
    {
        $user = User::where('barangay', auth()->user()->barangay)->findOrFail($id);
        $user->delete(); // This will trigger the auditable trait's deleted event

        return to_route('users.index')->with('success', 'User archived successfully.');
    }

    /**
     * Restore a soft-deleted user.
     */
    public function restore(string $id)
    {
        $user = User::withTrashed()->where('barangay', auth()->user()->barangay)->findOrFail($id);

        // Restore the user - this will automatically trigger the auditable trait's restored event
        $user->restore();

        return to_route('users.index')->with('success', 'User restored successfully.');
    }

    /**
     * Permanently delete a user.
     */
    public function forceDelete(string $id)
    {
        $user = User::withTrashed()->where('barangay', auth()->user()->barangay)->findOrFail($id);

        // Force delete - this will trigger the auditable trait's forceDeleted event
        $user->forceDelete();

        return to_route('users.index')->with('success', 'User permanently deleted.');
    }

    public function resetPassword(string $id)
    {
        $user = User::where('barangay', auth()->user()->barangay)->findOrFail($id);
        $password = Str::random(12);
        $user->password = Hash::make($password);
        $user->save();

        $admin = auth()->user();
        Log::info("Password reset for user #{$user->id} ({$user->name}) by admin #{$admin->id} ({$admin->name}): new password = {$password}");

        return response()->json(['password' => $password]);
    }

    public function approve(string $id)
    {
        $user = User::where('barangay', auth()->user()->barangay)->findOrFail($id);

        $user->update(['status' => 'approved']);

        return to_route('users.index')->with('success', 'User approved successfully.');
    }

    public function reject(string $id)
    {
        $user = User::where('barangay', auth()->user()->barangay)->findOrFail($id);

        $user->update(['status' => 'rejected']);

        return to_route('users.index')->with('success', 'User rejected.');
    }
}
