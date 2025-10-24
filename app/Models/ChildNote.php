<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChildNote extends Model
{
    use HasFactory;

    protected $fillable = ['child_id', 'user_id', 'note'];

    // Each note belongs to one child
    public function child()
    {
        return $this->belongsTo(Child::class);
    }

    // Each note was written by one user
    public function author()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

}
