<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Vaccine;

class VaccinePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasRole('Admin') || $user->hasRole('Healthworker');
    }

    public function create(User $user): bool
    {
        return $user->hasRole('Admin') || $user->hasRole('Healthworker');
    }

    public function update(User $user, Vaccine $vaccine): bool
    {
        return $user->hasRole('Admin') || $user->hasRole('Healthworker');
    }

    public function delete(User $user, Vaccine $vaccine): bool
    {
        return $user->hasRole('Admin') || $user->hasRole('Healthworker');
    }
}
