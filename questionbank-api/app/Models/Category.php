<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $fillable = ['name', 'name_ml', 'slug', 'type'];

    public function subcategories()
    {
        return $this->hasMany(Subcategory::class);
    }

    public function questions()
    {
        return $this->hasMany(Question::class);
    }
}
