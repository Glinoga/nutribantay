<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class ChildVitamin extends Model
{
    use HasFactory;

    protected $fillable = [
        'child_id',
        'vitamin_id',
    ];

    public function child(): BelongsTo
    {
        return $this->belongsTo(Child::class);
    }

    public function vitamin(): BelongsTo
    {
        return $this->belongsTo(Vitamin::class);
    }

    public function doses(): HasMany
    {
        return $this->hasMany(ChildVitaminDose::class)->orderBy('dose_number', 'asc');
    }

    public function lastDose(): HasOne
    {
        return $this->hasOne(ChildVitaminDose::class)->latestOfMany('dose_number');
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
