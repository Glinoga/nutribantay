<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Child extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'sex',
        'age',
        'weight',
        'height',
        'created_by',
        'address',
        'contact_number', // ✅ fixed invalid key name
        'birthdate',
        'barangay',
        'updated_by',
    ];

    protected $casts = [
        'birthdate' => 'date',
    ];

    // 🔹 Relation to User who created the record
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // 🔹 Relation to User who last updated it
    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    // 🔹 Relation to notes (if you have a ChildNote model)
    public function notes()
    {
        return $this->hasMany(ChildNote::class);
    }   


    // 🔹 Optional author relation (if applicable)
    public function author()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // 🔹 Relation to health logs
    public function healthlogs()
    {
        return $this->hasMany(Healthlog::class);
    }
}
