<?php

namespace App\Http\Controllers;

use Hash;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */ 
    public function index(Request $request)
{
    $query = User::with('roles'); // eager load roles

    if ($search = $request->input('search')) {
        $query->where(function ($q) use ($search) {
            $q->where('id', $search) // exact match for ID
              ->orWhere('name', 'like', "%{$search}%")
              ->orWhere('email', 'like', "%{$search}%")
              ->orWhereHas('roles', function ($roleQuery) use ($search) {
                  $roleQuery->where('name', 'like', "%{$search}%");
              });
        });
    }

    $users = $query->get();

    return Inertia::render('Users/Index', [
        'users' => $users->map(fn($user) => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'roles' => $user->getRoleNames()->toArray(),
        ]),
        'filters' => $request->only('search'), // 👈 so frontend knows current search
    ]);
}



    public function archived()
    {
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
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        return redirect()->route('users.index');
    }

    public function updateRole(Request $request, string $id)
{
    $request->validate([
        'role' => 'required|in:admin,healthworker',
    ]);

    $user = User::findOrFail($id);
    $user->syncRoles([$request->role]);

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
        'barangay' => 'required|string|max:255'
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
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $user = User::findOrFail($id);
        $user->delete(); // soft delete instead of permanent
        return to_route('users.index')->with('success', 'User archived successfully.');
    }

    public function restore(string $id)
    {
        $user = User::withTrashed()->findOrFail($id);
        $user->restore();
        return to_route('users.index')->with('success', 'User restored successfully.');
    }

    public function forceDelete(string $id)
{
    $user = User::withTrashed()->findOrFail($id);
    $user->forceDelete();
    return to_route('users.index')->with('success', 'User permanently deleted.');
}



}
