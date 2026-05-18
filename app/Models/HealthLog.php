<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class HealthLog extends Model
{
    use HasFactory, SoftDeletes;

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

        'recommendation',
    ];

    protected $casts = [
        'weight' => 'float',
        'height' => 'float',
        'bmi' => 'float',

        'vitamin_a' => 'boolean',
        'deworming' => 'boolean',

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
