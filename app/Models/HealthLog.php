<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HealthLog extends Model
{
    use HasFactory;

    protected $table = 'health_logs';

    protected $fillable = [
        'child_id',
        'user_id',
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

        'recommendation',
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

    /**
     * Auto-calculate vaccine status
     */
    public function getVaccineStatusAttribute($value)
    {
        if (! $this->vaccine_name) {
            return null;
        }

        if ($this->date_given) {
            return 'Completed';
        }

        if ($this->next_due_date && Carbon::parse($this->next_due_date)->isPast()) {
            return 'Overdue';
        }

        return 'Pending';
    }
}
