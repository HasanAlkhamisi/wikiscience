<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    //
    protected $fillable = [
        'local_id',
        'name',
        'parent_id',
        'user_id',
    ];
    public function parent()
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }
    public function children()
    {
        return $this->hasMany(Category::class, 'parent_id');
    }
    public function contents()
    {
        return $this->hasMany(Content::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function depth()
    {
        $depth = 0;
        $current = $this;

        while ($current->parent_id !== null) {
            $depth++;
            $current = $current->parent;
        }
        return $depth;
    }
}
