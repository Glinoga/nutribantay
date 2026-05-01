<?php

namespace App\Policies;

use App\Models\Child;
use App\Models\ChildVaccine;
use App\Models\ChildVaccineDose;
use App\Models\User;

class ChildVaccinePolicy
{
    private function canAccess(User $user, Child $child): bool
    {
        return $child->barangay === $user->barangay || $user->hasRole('Admin');
    }

    public function index(User $user, Child $child): bool
    {
        return $this->canAccess($user, $child);
    }

    public function create(User $user, Child $child): bool
    {
        return $this->canAccess($user, $child);
    }

    public function delete(User $user, Child $child, ChildVaccine $childVaccine): bool
    {
        return $this->canAccess($user, $child) && $childVaccine->child_id === $child->id;
    }

    public function recordDose(User $user, Child $child, ChildVaccine $childVaccine): bool
    {
        return $this->canAccess($user, $child) && $childVaccine->child_id === $child->id;
    }

    public function updateDose(User $user, Child $child, ChildVaccine $childVaccine, ChildVaccineDose $dose): bool
    {
        return $this->canAccess($user, $child) && $dose->child_vaccine_id === $childVaccine->id;
    }

    public function destroyDose(User $user, Child $child, ChildVaccineDose $dose): bool
    {
        return $this->canAccess($user, $dose->childVaccine->child);
    }
}
