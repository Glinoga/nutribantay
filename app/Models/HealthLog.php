<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HealthLog extends Model
{
    use HasFactory;
     protected $table = 'health_logs';

    protected $fillable = [
        'child_id',
        'user_id',

        'age_in_months',
        'weight',
        'height',
        'bmi',

        'status_wfa',
        'status_lfa',
        'status_wfl_wfh',
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

    protected $casts = [
        'weight' => 'float',
        'height' => 'float',
        'bmi' => 'float',

        'vitamin_a' => 'boolean',
        'deworming' => 'boolean',

        'dose_number' => 'integer',

        'date_given' => 'datetime',
        'next_due_date' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function child()
    {
        return $this->belongsTo(Child::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
