<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Question;
use App\Models\Tag;
use App\Models\QuestionOption;
use App\Models\QuestionImage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class QuestionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Question::with(['category', 'subcategory', 'images', 'options', 'tags', 'user']);

        // Default visibility rule: non-admin can only see approved questions or their own
        $user = $request->user('sanctum');
        if (!$user) {
            $query->where('status', 'approved');
        } elseif ($user->role !== 'admin') {
            $query->where(function ($q) use ($user) {
                $q->where('status', 'approved')
                  ->orWhere('user_id', $user->id);
            });
        } else {
            // Admin can filter by status
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }
        }

        // Apply filters
        if ($request->filled('my_questions') && $user) {
            $query->where('user_id', $user->id);
        } elseif ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('subcategory_id')) {
            $query->where('subcategory_id', $request->subcategory_id);
        }

        if ($request->filled('difficulty')) {
            $query->where('difficulty', $request->difficulty);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('language')) {
            $query->where('language', $request->language);
        }

        // Tag filter (by tag name or slug)
        if ($request->filled('tag')) {
            $query->whereHas('tags', function ($q) use ($request) {
                $q->where('slug', $request->tag)->orWhere('name', $request->tag);
            });
        }

        // Keyword Search
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('question_text', 'like', "%{$search}%")
                  ->orWhere('question_text_ml', 'like', "%{$search}%")
                  ->orWhere('answer_text', 'like', "%{$search}%")
                  ->orWhere('answer_text_ml', 'like', "%{$search}%");
            });
        }

        // Paginate questions
        $perPage = $request->get('per_page', 10);
        $questions = $query->latest()->paginate($perPage);

        return response()->json($questions);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'subcategory_id' => 'nullable|exists:subcategories,id',
            'question_text' => 'required|string',
            'question_text_ml' => 'nullable|string',
            'answer_text' => 'nullable|string',
            'answer_text_ml' => 'nullable|string',
            'type' => 'required|string|in:mcq,descriptive',
            'difficulty' => 'required|string|in:easy,medium,hard',
            'language' => 'required|string|in:en,ml',
            'metadata' => 'nullable|array',
            'options' => 'required_if:type,mcq|array|min:2',
            'options.*.option_text' => 'required_with:options|string',
            'options.*.option_text_ml' => 'nullable|string',
            'options.*.is_correct' => 'required_with:options|boolean',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
        ]);

        $user = $request->user();

        // Create the question
        $question = Question::create([
            'user_id' => $user->id,
            'category_id' => $validated['category_id'],
            'subcategory_id' => $validated['subcategory_id'] ?? null,
            'question_text' => $validated['question_text'],
            'question_text_ml' => $validated['question_text_ml'] ?? null,
            'answer_text' => $validated['answer_text'] ?? null,
            'answer_text_ml' => $validated['answer_text_ml'] ?? null,
            'type' => $validated['type'],
            'difficulty' => $validated['difficulty'],
            'language' => $validated['language'],
            'metadata' => $validated['metadata'] ?? null,
            'status' => $user->role === 'admin' ? 'approved' : 'pending', // Auto-approve if admin
        ]);

        // Store options if MCQ
        if ($validated['type'] === 'mcq' && isset($validated['options'])) {
            foreach ($validated['options'] as $optionData) {
                $question->options()->create([
                    'option_text' => $optionData['option_text'],
                    'option_text_ml' => $optionData['option_text_ml'] ?? null,
                    'is_correct' => $optionData['is_correct'],
                ]);
            }
        }

        // Associate tags
        if (isset($validated['tags']) && !empty($validated['tags'])) {
            $tagIds = [];
            foreach ($validated['tags'] as $tagName) {
                $tagSlug = Str::slug($tagName);
                $tag = Tag::firstOrCreate(
                    ['slug' => $tagSlug],
                    ['name' => $tagName, 'name_ml' => $tagName] // Simple fallback
                );
                $tagIds[] = $tag->id;
            }
            $question->tags()->sync($tagIds);
        }

        return response()->json($question->load(['category', 'subcategory', 'options', 'tags']), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $question = Question::with(['category', 'subcategory', 'images', 'options', 'tags', 'user'])->findOrFail($id);
        return response()->json($question);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $question = Question::findOrFail($id);
        $user = $request->user();

        // Authorization: Creator or Admin
        if ($question->user_id !== $user->id && $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'category_id' => 'sometimes|required|exists:categories,id',
            'subcategory_id' => 'nullable|exists:subcategories,id',
            'question_text' => 'sometimes|required|string',
            'question_text_ml' => 'nullable|string',
            'answer_text' => 'nullable|string',
            'answer_text_ml' => 'nullable|string',
            'type' => 'sometimes|required|string|in:mcq,descriptive',
            'difficulty' => 'sometimes|required|string|in:easy,medium,hard',
            'language' => 'sometimes|required|string|in:en,ml',
            'metadata' => 'nullable|array',
            'options' => 'required_if:type,mcq|array|min:2',
            'options.*.id' => 'nullable|exists:question_options,id',
            'options.*.option_text' => 'required_with:options|string',
            'options.*.option_text_ml' => 'nullable|string',
            'options.*.is_correct' => 'required_with:options|boolean',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
        ]);

        // Update fields
        $question->update(array_filter([
            'category_id' => $validated['category_id'] ?? null,
            'subcategory_id' => $validated['subcategory_id'] ?? null,
            'question_text' => $validated['question_text'] ?? null,
            'question_text_ml' => $validated['question_text_ml'] ?? null,
            'answer_text' => $validated['answer_text'] ?? null,
            'answer_text_ml' => $validated['answer_text_ml'] ?? null,
            'type' => $validated['type'] ?? null,
            'difficulty' => $validated['difficulty'] ?? null,
            'language' => $validated['language'] ?? null,
            'metadata' => $validated['metadata'] ?? null,
        ]));

        // Handle Options update
        if ($question->type === 'mcq' && isset($validated['options'])) {
            // Delete old options that aren't in the update list
            $optionIdsToKeep = collect($validated['options'])->pluck('id')->filter()->all();
            $question->options()->whereNotIn('id', $optionIdsToKeep)->delete();

            foreach ($validated['options'] as $optionData) {
                if (isset($optionData['id'])) {
                    QuestionOption::where('id', $optionData['id'])->update([
                        'option_text' => $optionData['option_text'],
                        'option_text_ml' => $optionData['option_text_ml'] ?? null,
                        'is_correct' => $optionData['is_correct'],
                    ]);
                } else {
                    $question->options()->create([
                        'option_text' => $optionData['option_text'],
                        'option_text_ml' => $optionData['option_text_ml'] ?? null,
                        'is_correct' => $optionData['is_correct'],
                    ]);
                }
            }
        } elseif ($question->type === 'descriptive') {
            // Clean up any options if switched to descriptive
            $question->options()->delete();
        }

        // Associate tags
        if (isset($validated['tags'])) {
            $tagIds = [];
            foreach ($validated['tags'] as $tagName) {
                $tagSlug = Str::slug($tagName);
                $tag = Tag::firstOrCreate(
                    ['slug' => $tagSlug],
                    ['name' => $tagName, 'name_ml' => $tagName]
                );
                $tagIds[] = $tag->id;
            }
            $question->tags()->sync($tagIds);
        }

        return response()->json($question->load(['category', 'subcategory', 'options', 'tags']));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, $id)
    {
        $question = Question::findOrFail($id);
        $user = $request->user();

        if ($question->user_id !== $user->id && $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $question->delete();
        return response()->json(['message' => 'Question deleted successfully']);
    }

    /**
     * Upload an image/diagram for a question.
     */
    public function uploadImage(Request $request, $id)
    {
        $question = Question::findOrFail($id);
        $user = $request->user();

        if ($question->user_id !== $user->id && $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:4096',
            'caption' => 'nullable|string|max:255',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('uploads', 'public');

            $image = QuestionImage::create([
                'question_id' => $question->id,
                'image_path' => '/storage/' . $path,
                'caption' => $request->caption ?? null,
            ]);

            return response()->json($image, 201);
        }

        return response()->json(['message' => 'No image file uploaded'], 400);
    }
}
