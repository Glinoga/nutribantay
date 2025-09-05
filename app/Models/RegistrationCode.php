<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RegistrationCode extends Model
{
     protected $fillable = ['code', 'is_used', 'expires_at'];
}
