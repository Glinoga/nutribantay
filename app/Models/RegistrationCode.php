<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RegistrationCode extends Model
{
    protected $fillable = ['code', 'expires_at'];

    protected static function booted()
    {
        static::created(function ($code) {
            $count = self::count();

            if ($count > 5) {
                // Delete the oldest code(s) while keeping only 5
                self::orderBy('created_at', 'asc')
                    ->take($count - 5)
                    ->delete();
            }
        });
    }
}
