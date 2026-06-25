<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AnnouncementImage extends Model
{
    protected $fillable = [
        'announcement_id',
        'image_path',
        'sort_order',
    ];

    protected $hidden = ['image_path'];

    protected $appends = ['image_url'];

    public function announcement()
    {
        return $this->belongsTo(Announcement::class);
    }

    public function getImageUrlAttribute(): string
    {
        return '/storage/'.$this->image_path;
    }
}
