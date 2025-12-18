<?php

namespace App\Models;

use App\Traits\AuditableModel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Child extends Model
{
    use HasFactory, AuditableModel;

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
    protected $appends = ['fullname', 'formatted_name'];

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
        return $this->hasMany(Healthlog::class);
    }
}
