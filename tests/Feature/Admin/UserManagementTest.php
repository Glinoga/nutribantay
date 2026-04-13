<?php

use App\Models\User;
use App\Models\RegistrationCode;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    $this->admin = User::factory()->create([
        'barangay' => 1,
    ]);
    $this->admin->assignRole('Admin');

    $this->otherBarangayAdmin = User::factory()->create([
        'barangay' => 2,
    ]);
    $this->otherBarangayAdmin->assignRole('Admin');
});

describe('Admin User Management', function () {
    test('admin can view users in their barangay', function () {
        $userInSameBarangay = User::factory()->create(['barangay' => 1]);
        $userInOtherBarangay = User::factory()->create(['barangay' => 2]);

        $response = $this->actingAs($this->admin)->get('/users');

        $response->assertOk();
        $response->assertSee($userInSameBarangay->name);
        $response->assertDontSee($userInOtherBarangay->name);
    });

    test('admin can create user in their barangay', function () {
        $response = $this->actingAs($this->admin)->post('/users', [
            'name' => 'New Healthworker',
            'email' => 'newhealthworker@test.com',
            'password' => 'password123',
            'role' => 'Healthworker',
        ]);

        $response->assertRedirect('/users');
        
        $this->assertDatabaseHas('users', [
            'name' => 'New Healthworker',
            'email' => 'newhealthworker@test.com',
            'barangay' => 1,
        ]);
    });

    test('admin cannot change user barangay when editing', function () {
        $targetUser = User::factory()->create([
            'barangay' => 1,
            'name' => 'Target User',
        ]);
        $targetUser->assignRole('Healthworker');

        $response = $this->actingAs($this->admin)->put("/users/{$targetUser->id}", [
            'name' => 'Updated Name',
            'email' => $targetUser->email,
            'role' => 'Admin',
        ]);

        $response->assertRedirect('/users');
        
        $this->assertDatabaseHas('users', [
            'id' => $targetUser->id,
            'name' => 'Updated Name',
            'barangay' => 1, // barangay should remain unchanged
        ]);
    });

    test('admin cannot edit user from other barangay', function () {
        $targetUser = User::factory()->create([
            'barangay' => 2,
            'name' => 'Other Bar User',
        ]);

        $response = $this->actingAs($this->admin)->put("/users/{$targetUser->id}", [
            'name' => 'Hacked Name',
            'email' => $targetUser->email,
            'role' => 'Admin',
        ]);

        $response->assertStatus(403);
    });

    test('admin cannot assign invalid role', function () {
        $targetUser = User::factory()->create(['barangay' => 1]);
        $targetUser->assignRole('Healthworker');

        $response = $this->actingAs($this->admin)->put("/users/{$targetUser->id}", [
            'name' => $targetUser->name,
            'email' => $targetUser->email,
            'role' => 'NonExistentRole',
        ]);

        $response->assertSessionHasErrors('role');
    });

    test('admin can archive user', function () {
        $targetUser = User::factory()->create(['barangay' => 1]);

        $response = $this->actingAs($this->admin)->delete("/users/{$targetUser->id}");

        $response->assertRedirect('/users');
        $this->assertSoftDeleted('users', ['id' => $targetUser->id]);
    });

    test('admin can view archived users', function () {
        $targetUser = User::factory()->create(['barangay' => 1]);
        $targetUser->delete();

        $response = $this->actingAs($this->admin)->get('/users/archived');

        $response->assertOk();
        $response->assertSee($targetUser->name);
    });

    test('admin can restore archived user', function () {
        $targetUser = User::factory()->create(['barangay' => 1]);
        $targetUser->delete();

        $response = $this->actingAs($this->admin)->post("/users/{$targetUser->id}/restore");

        $response->assertRedirect('/users');
        $this->assertDatabaseHas('users', [
            'id' => $targetUser->id,
            'deleted_at' => null,
        ]);
    });

    test('admin can force delete user', function () {
        $targetUser = User::factory()->create(['barangay' => 1]);
        $targetUser->delete();

        $response = $this->actingAs($this->admin)->delete("/users/{$targetUser->id}/force-delete");

        $response->assertRedirect('/users');
        $this->assertDatabaseMissing('users', ['id' => $targetUser->id]);
    });
});

describe('Registration Code Management', function () {
    test('admin can generate registration code for their barangay', function () {
        $response = $this->actingAs($this->admin)->post('/registration-codes/generate');

        $response->assertOk();
        $response->assertJsonStructure(['codes' => [['code', 'expires_at', 'barangay']]]);
        
        $codes = $response->json('codes');
        expect($codes[0]['barangay'])->toBe(1);
    });

    test('admin can generate multiple registration codes', function () {
        $response = $this->actingAs($this->admin)->post('/registration-codes/generate', [
            'count' => 5,
        ]);

        $response->assertOk();
        $codes = $response->json('codes');
        expect($codes)->toHaveCount(5);
    });

    test('generated code is linked to barangay', function () {
        $response = $this->actingAs($this->admin)->post('/registration-codes/generate');
        
        $code = $response->json('codes.0.code');
        
        $this->assertDatabaseHas('registration_codes', [
            'code' => $code,
            'barangay' => 1,
        ]);
    });
});

describe('Audit Log', function () {
    test('admin can view audit logs', function () {
        $response = $this->actingAs($this->admin)->get('/audit-logs');

        $response->assertOk();
    });

    test('admin can filter audit logs by action', function () {
        $response = $this->actingAs($this->admin)->get('/audit-logs?action=user_created');

        $response->assertOk();
    });
});