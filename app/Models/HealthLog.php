<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HealthLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'child_id',
        'user_id',
        'weight',
        'height',
        'bmi',
        'zscore_wfa',
        'zscore_lfa',
        'zscore_wfh',
        'nutrition_status',
        'micronutrient_powder',
        'ruf',
        'rusf',
        'complementary_food',
        'vitamin_a',
        'deworming',
        'vaccine_name',
        'dose_number',
        'date_given',
        'next_due_date',
        'vaccine_status',
    ];

    /**
     * Relationship: A HealthLog belongs to a Child.
     */
    public function child()
    {
        return $this->belongsTo(Child::class);
    }

    /**
     * Relationship: A HealthLog belongs to a User (created by).
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
