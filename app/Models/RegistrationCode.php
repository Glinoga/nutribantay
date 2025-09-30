<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RegistrationCode extends Model
{
    protected $fillable = ['code', 'expires_at'];

    protected static function booted()
    {
        // 
    }
}
