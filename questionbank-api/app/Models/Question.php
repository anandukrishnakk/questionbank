<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    protected $fillable = [
        'user_id',
        'category_id',
        'subcategory_id',
        'question_text',
        'question_text_ml',
        'answer_text',
        'answer_text_ml',
        'type',
        'difficulty',
        'status',
        'language',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function subcategory()
    {
        return $this->belongsTo(Subcategory::class);
    }

    public function images()
    {
        return $this->hasMany(QuestionImage::class);
    }

    public function options()
    {
        return $this->hasMany(QuestionOption::class);
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'question_tags');
    }
}
