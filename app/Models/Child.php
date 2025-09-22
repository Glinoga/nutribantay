<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Child extends Model
{
    use HasFactory;

    protected $fillable = [
    'name',
    'sex',
    'age',
    'weight',
    'height',
    'created_by',
    'barangay',
    'updated_by',
];


    // relation to user who created the child
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

public function author()
{
    return $this->belongsTo(User::class, 'user_id');
}



}
