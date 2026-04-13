<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RegistrationCode extends Model
{
    protected $fillable = ['code', 'expires_at', 'barangay'];

    protected static function booted()
    {
        // 
    }
}
