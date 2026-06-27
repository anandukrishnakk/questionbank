<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('category_id')->constrained()->onDelete('cascade');
            $table->foreignId('subcategory_id')->nullable()->constrained()->onDelete('set null');
            $table->text('question_text');
            $table->text('question_text_ml')->nullable();
            $table->text('answer_text')->nullable();
            $table->text('answer_text_ml')->nullable();
            $table->string('type')->default('descriptive'); // mcq or descriptive
            $table->string('difficulty')->default('medium'); // easy, medium, hard
            $table->string('status')->default('pending'); // pending, approved, rejected
            $table->string('language')->default('en'); // en or ml
            $table->json('metadata')->nullable(); // For category-specific fields (e.g. company, subject, class, exam, year, etc.)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('questions');
    }
};
