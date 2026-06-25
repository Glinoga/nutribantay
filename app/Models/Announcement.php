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

    protected $hidden = ['image'];

    protected $appends = ['is_expired', 'image_url', 'gallery_images', 'first_image_url'];

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
            $announcement->images()->each(function (AnnouncementImage $img) {
                Storage::disk('public')->delete($img->image_path);
                $img->delete();
            });
        });
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function images()
    {
        return $this->hasMany(AnnouncementImage::class)->orderBy('sort_order');
    }

    public function getGalleryImagesAttribute(): array
    {
        return $this->images->map(fn (AnnouncementImage $img) => [
            'id' => $img->id,
            'image_url' => $img->image_url,
        ])->toArray();
    }

    public function getFirstImageUrlAttribute(): ?string
    {
        $first = $this->images->first();
        if ($first) {
            return $first->image_url;
        }

        return $this->image_url;
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
