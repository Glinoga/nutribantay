<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GrowthStandard extends Model
{
    protected $table = 'growth_standards';

    protected $fillable = [
        'gender',        // 'boy' or 'girl'
        'type',          // weight_for_age, length_for_age, weight_for_length, weight_for_height
        'measure_value', // age in months OR height in cm (0.5 increments)
        'sd_neg_3',
        'sd_neg_2',
        'sd_plus_2',
        'sd_plus_3',
    ];

    protected $casts = [
        'measure_value' => 'float',
        'sd_neg_3'      => 'float',
        'sd_neg_2'      => 'float',
        'sd_plus_2'     => 'float',
        'sd_plus_3'     => 'float',
    ];
}
