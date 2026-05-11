<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Announcement extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title',
        'date',
        'end_date',
        'author',
        'category_id',
        'summary',
        'content',
        'image',
    ];

    protected $appends = ['is_expired'];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function getIsExpiredAttribute(): bool
    {
        if (! $this->end_date) {
            return false;
        }

        return Carbon::parse($this->end_date)->isPast();
    }
}
