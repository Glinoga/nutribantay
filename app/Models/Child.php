<?php

namespace App\Models;

use App\Traits\AuditableModel;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Child extends Model
{
    use AuditableModel, HasFactory, SoftDeletes;

    protected $fillable = [
        'first_name',
        'middle_initial',
        'last_name',
        'sex',
        'belongs_to_ip',
        'weight',
        'height',
        'nutrition_status',
        'birthdate',
        'barangay',
        'address',
        'parent_caregiver_name',
        'contact_number',
        'created_by',
        'updated_by',
        'slug',
    ];

    protected $casts = [
        'birthdate' => 'date',
        'belongs_to_ip' => 'boolean',
    ];

    // 🔥 This exposes computed attributes (fullname, formatted_name) to JSON/API
    protected $appends = ['fullname', 'formatted_name', 'bmi', 'age', 'is_over_60_months'];

    protected static function booted(): void
    {
        static::creating(function (Child $child) {
            $child->normalizeNames();

            if (! $child->slug) {
                $base = Str::slug($child->first_name.' '.$child->last_name);
                $slug = $base;
                $counter = 1;

                while (static::withTrashed()->where('slug', $slug)->exists()) {
                    $slug = $base.'-'.++$counter;
                }

                $child->slug = $slug;
            }
        });

        static::updating(function (Child $child) {
            $child->normalizeNames();
        });
    }

    protected function normalizeNames(): void
    {
        $this->first_name = $this->normalizeName($this->first_name);
        $this->last_name = $this->normalizeName($this->last_name);
        $this->parent_caregiver_name = $this->parent_caregiver_name ? $this->normalizeName($this->parent_caregiver_name) : null;

        if ($this->middle_initial) {
            $this->middle_initial = strtoupper(trim($this->middle_initial));
        }
    }

    protected function normalizeName(string $name): string
    {
        $name = trim(preg_replace('/\s+/', ' ', $name));

        $name = implode('-', array_map(
            fn ($part) => implode(' ', array_map(
                fn ($word) => strtoupper($word),
                explode(' ', $part)
            )),
            explode('-', $name)
        ));

        return $name;
    }

    /*
    |--------------------------------------------------------------------------
    | ACCESSORS
    |--------------------------------------------------------------------------
    */

    // Full name accessor: "Firstname M. Lastname"
    public function getFullnameAttribute()
    {
        $mi = $this->middle_initial ? strtoupper(rtrim($this->middle_initial, '.')).'.' : '';

        return trim("{$this->first_name} {$mi} {$this->last_name}");
    }

    // Lastname, Firstname (M.)
    public function getFormattedNameAttribute()
    {
        $mi = $this->middle_initial ? strtoupper(rtrim($this->middle_initial, '.')).'.' : '';

        return trim("{$this->last_name}, {$this->first_name} {$mi}");
    }

    // BMI accessor - calculates from weight and height
    public function getBmiAttribute()
    {
        if (! $this->weight || ! $this->height || $this->height <= 0) {
            return null;
        }

        return round($this->weight / pow($this->height / 100, 2), 2);
    }

    // Age accessor - calculates from birthdate in MONTHS (floor)
    public function getAgeAttribute()
    {
        if (! $this->birthdate) {
            return null;
        }

        $birthdate = Carbon::parse($this->birthdate);

        if ($birthdate->isFuture()) {
            return null;
        }

        return floor($birthdate->diffInMonths(Carbon::now()));
    }

    // Boolean flag - 60 months and above (no longer in 0-5 years bracket)
    public function getIsOver60MonthsAttribute()
    {
        return $this->age >= 60;
    }

    public function abortIfOveraged(): void
    {
        if ($this->is_over_60_months) {
            abort(403, 'Children aged 60 months or older cannot be modified.');
        }
    }

    /*
    |--------------------------------------------------------------------------
    | RELATIONSHIPS
    |--------------------------------------------------------------------------
    */

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function notes()
    {
        return $this->hasMany(ChildNote::class);
    }

    public function healthlogs()
    {
        return $this->hasMany(HealthLog::class);
    }

    public function latestHealthlog()
    {
        return $this->hasOne(HealthLog::class)->latestOfMany();
    }
}
