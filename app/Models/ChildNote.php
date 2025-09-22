<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChildNote extends Model
{
    use HasFactory;

    protected $fillable = ['child_id', 'user_id', 'note'];

    public function child() {
        return $this->belongsTo(Child::class);
    }

    public function author() {
        return $this->belongsTo(User::class, 'user_id');
    }
    public function notes(){
        return $this->hasMany(ChildNote::class);
    }

}

