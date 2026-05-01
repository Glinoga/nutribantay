<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChildVaccineDose extends Model
{
    use HasFactory;

    protected $fillable = [
        'child_vaccine_id',
        'dose_number',
        'date_given',
        'next_due_date',
        'remarks',
        'administered_by',
    ];

    protected $casts = [
        'date_given' => 'date',
        'next_due_date' => 'date',
        'dose_number' => 'integer',
    ];

    public function childVaccine(): BelongsTo
    {
        return $this->belongsTo(ChildVaccine::class);
    }

    public function administeredBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'administered_by');
    }

    public function getDoseStatusAttribute(): string
    {
        if ($this->date_given) {
            return 'Completed';
        }

        if ($this->next_due_date && $this->next_due_date->isPast()) {
            return 'Overdue';
        }

        return 'Pending';
    }
}
