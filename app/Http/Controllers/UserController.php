<?php

namespace App\Http\Controllers;

use App\Models\RegistrationCode;
use App\Models\User;
use Hash;
use Illuminate\Http\Request;
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

        $query = User::with('roles')
            ->where('barangay', $user->barangay); // only same barangay

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
                'barangay' => $u->barangay,
                'status' => $u->status,
                'registration_code' => $u->registrationCode?->code,
            ]),
            'filters' => $request->only('search'),
        ]);
    }

    public function archived()
    {
        $user = auth()->user();

        $archivedUsers = User::onlyTrashed()
            ->where('barangay', $user->barangay) // restrict by barangay
            ->get();

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
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
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
            'password' => 'required|string|min:6',
            'role' => 'required|string|exists:roles,name',
        ]);

        $admin = auth()->user();

        // Generate registration code (8 random characters like before)
        $code = strtoupper(\Illuminate\Support\Str::random(8));

        // Create registration code
        $registrationCode = RegistrationCode::create([
            'code' => $code,
            'barangay' => $admin->barangay,
            'is_used' => true, // Mark as used (assigned to this user)
        ]);

        // Check for duplicate email if provided
        $email = $request->input('email');
        if ($email && User::where('email', $email)->exists()) {
            return response()->json(['message' => 'Email already exists'], 422);
        }

        // Create user with linked registration code
        $newUser = User::create([
            'name' => $request->name,
            'email' => $email, // nullable
            'password' => Hash::make($request->password),
            'barangay' => $admin->barangay,
            'status' => 'approved',
            'registration_code_id' => $registrationCode->id,
        ]);

        $newUser->assignRole($request->role);

        return response()->json([
            'message' => 'User created successfully',
            'code' => $code,
            'password' => $request->password,
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $user = User::findOrFail($id);

        return Inertia::render('Users/Show', [
            'user' => $user,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $user = User::find($id);

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
            'email' => 'required',
            'password' => 'nullable|string|min:8',
            'role' => 'required|string|exists:roles,name',
        ]);

        $user = auth()->user();
        $targetUser = User::findOrFail($id);

        // Prevent admin from editing users in different barangays
        if ($targetUser->barangay !== $user->barangay) {
            abort(403, 'You cannot edit users from other barangays.');
        }

        // Validate role exists in database
        if (! Role::where('name', $request->role)->exists()) {
            return back()->withErrors(['role' => 'Invalid role selected.']);
        }

        $targetUser->name = $request->name;
        $targetUser->email = $request->email;

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
        $user = User::findOrFail($id);
        $user->delete(); // This will trigger the auditable trait's deleted event

        return to_route('users.index')->with('success', 'User archived successfully.');
    }

    /**
     * Restore a soft-deleted user.
     */
    public function restore(string $id)
    {
        $user = User::withTrashed()->findOrFail($id);

        // Restore the user - this will automatically trigger the auditable trait's restored event
        $user->restore();

        return to_route('users.index')->with('success', 'User restored successfully.');
    }

    /**
     * Permanently delete a user.
     */
    public function forceDelete(string $id)
    {
        $user = User::withTrashed()->findOrFail($id);

        // Force delete - this will trigger the auditable trait's forceDeleted event
        $user->forceDelete();

        return to_route('users.index')->with('success', 'User permanently deleted.');
    }

    public function approve(string $id)
    {
        $user = User::findOrFail($id);

        if ($user->barangay !== auth()->user()->barangay) {
            abort(403, 'You cannot approve users from other barangays.');
        }

        $user->update(['status' => 'approved']);

        return to_route('users.index')->with('success', 'User approved successfully.');
    }

    public function reject(string $id)
    {
        $user = User::findOrFail($id);

        if ($user->barangay !== auth()->user()->barangay) {
            abort(403, 'You cannot reject users from other barangays.');
        }

        $user->update(['status' => 'rejected']);

        return to_route('users.index')->with('success', 'User rejected.');
    }
}
