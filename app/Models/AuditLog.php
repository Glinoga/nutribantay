<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class AuditLog extends Model
{
    protected $fillable = [
        'user_id',
        'user_name',
        'action',
        'model_type',
        'model_id',
        'model_name',
        'description',
        'old_values',
        'new_values',
        'ip_address',
        'user_agent',
        'barangay',
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Log an action to the audit log.
     */
    public static function logAction(array $data): self
    {
        $user = Auth::user();
        
        $logData = array_merge([
            'user_id' => $user?->id,
            'user_name' => $user?->name,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'barangay' => $user?->barangay ?? null,
        ], $data);

        return self::create($logData);
    }

    /**
     * Relationship to the user who performed the action.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope to filter by action.
     */
    public function scopeByAction($query, string $action)
    {
        return $query->where('action', $action);
    }

    /**
     * Scope to filter by model type.
     */
    public function scopeByModelType($query, string $modelType)
    {
        return $query->where('model_type', $modelType);
    }

    /**
     * Scope to filter by barangay.
     */
    public function scopeByBarangay($query, string $barangay)
    {
        return $query->where('barangay', $barangay);
    }

    /**
     * Scope to filter by date range.
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }
}