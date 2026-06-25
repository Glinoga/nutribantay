<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

class SiteContent extends Model
{
    protected $fillable = [
        'page',
        'section',
        'key',
        'label',
        'description',
        'value',
        'type',
    ];

    protected $table = 'site_contents';

    public function scopeByPage($query, string $page)
    {
        return $query->where('page', $page);
    }

    public function scopeBySection($query, string $section)
    {
        return $query->where('section', $section);
    }

    public static function getContent(string $key, $default = null)
    {
        $record = self::where('key', $key)->first();

        return $record ? $record->value : $default;
    }

    public static function getByPage(string $page): Collection
    {
        return self::where('page', $page)->get()->keyBy('key');
    }

    public static function setContent(string $key, string $value): void
    {
        self::where('key', $key)->update(['value' => $value]);
    }

    public static function getAllGrouped(): Collection
    {
        return self::orderBy('page')->orderBy('id')->get()->groupBy('page');
    }
}
