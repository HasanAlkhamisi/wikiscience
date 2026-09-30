<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
class Content extends Model
{
    use SoftDeletes;

    //
    protected $fillable = ['local_id', 'category_id', 'user_id', 'type', 'title', 'body', 'file_path'];
    public function contents()
    {
        return $this->hasMany(Content::class);
    }

    public function favorites()
    {
        return $this->hasMany(Favorite::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
