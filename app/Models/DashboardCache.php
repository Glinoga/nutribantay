<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DashboardCache extends Model
{
    protected $table = 'dashboard_cache';

    protected $fillable = [
        'barangay',
        'total_children',
        'total_health_logs',
        'nutrition_breakdown',
        'age_breakdown',
        'monthly_logs',
        'vaccine_overdue',
        'vaccine_upcoming',
        'vitamin_overdue',
        'vitamin_upcoming',
        'today_children',
        'today_health_logs',
        'week_health_logs',
        'month_health_logs',
        'year_health_logs',
        'avg_bmi',
        'male_count',
        'female_count',
        'vitamin_a_given',
        'deworming_given',
        'total_with_logs',
        'ip_group_count',
    ];

    protected function casts(): array
    {
        return [
            'nutrition_breakdown' => 'array',
            'age_breakdown' => 'array',
            'monthly_logs' => 'array',
        ];
    }
}
