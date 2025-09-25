<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Announcement extends Model
{
    protected $fillable = [
        'title',
        'date',
        'end_date',
        'author',
        'category_id',
        'summary',
        'content',
        'image'
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
