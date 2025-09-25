<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Announcement extends Model
{
    protected $fillable = [
        'title',
        'date',
        'end_date',
        'summary',
        'content',
        'image'
    ];
}
