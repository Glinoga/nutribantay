<?php

namespace App\Models;

use App\Traits\AuditableModel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Child extends Model
{
    use HasFactory, SoftDeletes, AuditableModel;

    protected $fillable = [
        'first_name',
        'middle_initial',
        'last_name',
        'sex',
        'age',
        'weight',
        'height',
        'birthdate',
        'barangay',
        'address',
        'contact_number',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'birthdate' => 'date',
    ];

    // 🔥 This exposes computed attributes (fullname, formatted_name) to JSON/API
    protected $appends = ['fullname', 'formatted_name', 'bmi'];

    /*
    |--------------------------------------------------------------------------
    | ACCESSORS
    |--------------------------------------------------------------------------
    */

    // Full name accessor: "Firstname M. Lastname"
    public function getFullnameAttribute()
    {
        $mi = $this->middle_initial ? strtoupper($this->middle_initial) . '.' : '';
        return trim("{$this->first_name} {$mi} {$this->last_name}");
    }

    // Lastname, Firstname (M.)
    public function getFormattedNameAttribute()
    {
        $mi = $this->middle_initial ? strtoupper($this->middle_initial) . '.' : '';
        return trim("{$this->last_name}, {$this->first_name} {$mi}");
    }

    // BMI accessor - calculates from weight and height
    public function getBmiAttribute()
    {
        if (!$this->weight || !$this->height || $this->height <= 0) {
            return null;
        }
        return round($this->weight / pow($this->height / 100, 2), 2);
    }

    /*
    |--------------------------------------------------------------------------
    | RELATIONSHIPS
    |--------------------------------------------------------------------------
    */

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function notes()
    {
        return $this->hasMany(ChildNote::class);
    }

    public function healthlogs()
    {
        return $this->hasMany(HealthLog::class);
    }
}