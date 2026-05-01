<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class ChildVaccine extends Model
{
    use HasFactory;

    protected $fillable = [
        'child_id',
        'vaccine_id',
    ];

    public function child(): BelongsTo
    {
        return $this->belongsTo(Child::class);
    }

    public function vaccine(): BelongsTo
    {
        return $this->belongsTo(Vaccine::class);
    }

    public function doses(): HasMany
    {
        return $this->hasMany(ChildVaccineDose::class)->orderBy('dose_number', 'asc');
    }

    public function lastDose(): HasOne
    {
        return $this->hasOne(ChildVaccineDose::class)->latestOfMany('dose_number');
    }

    public function getProgressAttribute(): array
    {
        $totalDoses = $this->doses()->count();
        $completedDoses = $this->doses()->whereNotNull('date_given')->count();

        $lastDose = $this->lastDose;

        if ($lastDose && $lastDose->date_given && ! $lastDose->next_due_date) {
            $status = 'Completed';
        } elseif ($completedDoses > 0) {
            $status = 'In Progress';
        } elseif ($totalDoses > 0) {
            $status = 'Not Started';
        } else {
            $status = 'Not Started';
        }

        return [
            'completed' => $completedDoses,
            'total' => $totalDoses,
            'status' => $status,
        ];
    }
}
