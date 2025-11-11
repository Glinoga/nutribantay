<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Child extends Model
{
    use HasFactory;

    protected $fillable = [
    'uid',
    'name',
    'sex',
    'age',
    'weight',
    'height',
    'created_by',
    'barangay',
    'contact_number',
];


    // relation to user who created the child
    public function creator()
{
    return $this->belongsTo(User::class, 'created_by');
}

}
