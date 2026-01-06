<?php

namespace App\Http\Controllers;

use Hash;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use App\Models\AuditLog;
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
            'users' => $users->map(fn($u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'roles' => $u->getRoleNames()->toArray(),
                'barangay' => $u->barangay,
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

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $user->assignRole($request->role);

        return redirect()->route('users.index');
    }

    public function updateRole(Request $request, string $id)
    {
        $request->validate([
            'role' => 'required|in:admin,healthworker',
        ]);

        $user = User::findOrFail($id);
        $oldRoles = $user->getRoleNames()->toArray();
        
        $user->syncRoles([$request->role]);

        // Log role change
        AuditLog::logAction([
            'action' => 'updated',
            'model_type' => 'User',
            'model_id' => $user->id,
            'model_name' => $user->name,
            'description' => "User role changed from '" . implode(', ', $oldRoles) . "' to '{$request->role}'",
            'old_values' => ['roles' => $oldRoles],
            'new_values' => ['roles' => [$request->role]],
        ]);

        return to_route('users.index')->with('success', 'User role updated successfully.');
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
            'user' => $user
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
            'role' => 'required|in:admin,healthworker',
            'barangay' => 'required|integer'
        ]);

        $user = User::findOrFail($id);

        $user->name = $request->name;
        $user->email = $request->email;
        $user->barangay = $request->barangay;

        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        // Assign role with Spatie
        $user->syncRoles([$request->role]);

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
}