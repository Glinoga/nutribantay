<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

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
        'slug',
    ];

    protected $appends = ['is_expired', 'image_url'];

    protected static function booted(): void
    {
        static::creating(function (Announcement $announcement) {
            if (! $announcement->slug) {
                $base = Str::slug($announcement->title);
                $slug = $base;
                $counter = 1;

                while (static::withTrashed()->where('slug', $slug)->exists()) {
                    $slug = $base.'-'.++$counter;
                }

                $announcement->slug = $slug;
            }
        });

        static::forceDeleting(function (Announcement $announcement) {
            if ($announcement->image) {
                Storage::disk('public')->delete($announcement->image);
            }
        });
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function getImageUrlAttribute(): ?string
    {
        if (! $this->image) {
            return null;
        }

        return '/storage/'.$this->image;
    }

    public function getIsExpiredAttribute(): bool
    {
        if (! $this->end_date) {
            return false;
        }

        return Carbon::parse($this->end_date)->isPast();
    }
}
