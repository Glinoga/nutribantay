<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'color',
        'description'
    ];

    public function announcements()
    {
        return $this->hasMany(Announcement::class);
    }

        public static function availableColors()
    {
        return [
            'blue' => 'Blue',
            'red' => 'Red',
            'orange' => 'Orange',
            'yellow' => 'Yellow',
            'success' => 'Success',
            'info' => 'Info',
            'gray' => 'Gray',
        ];
    }
}
