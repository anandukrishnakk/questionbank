<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Question;
use App\Models\User;
use App\Models\Category;
use App\Models\Tag;

class AdminQuestionController extends Controller
{
    public function approve($id)
    {
        $question = Question::findOrFail($id);
        $question->update(['status' => 'approved']);
        return response()->json(['message' => 'Question approved successfully', 'question' => $question]);
    }

    public function reject($id)
    {
        $question = Question::findOrFail($id);
        $question->update(['status' => 'rejected']);
        return response()->json(['message' => 'Question rejected successfully', 'question' => $question]);
    }

    public function stats()
    {
        $totalUsers = User::count();
        $approvedQuestions = Question::where('status', 'approved')->count();
        $pendingQuestions = Question::where('status', 'pending')->count();
        $rejectedQuestions = Question::where('status', 'rejected')->count();
        $totalCategories = Category::count();

        return response()->json([
            'total_users' => $totalUsers,
            'approved_questions' => $approvedQuestions,
            'pending_questions' => $pendingQuestions,
            'rejected_questions' => $rejectedQuestions,
            'total_categories' => $totalCategories
        ]);
    }

    public function fetchOnline(Request $request)
    {
        $source = $request->input('source', 'local');
        $rawTopic = $request->input('topic', 'general');
        $topic = strtolower($rawTopic);
        $importedCount = 0;

        $categoryId = $request->input('category_id');
        $subcategoryId = $request->input('subcategory_id');

        if ($categoryId) {
            $category = Category::find($categoryId);
        } else {
            $category = Category::where('slug', 'interview-questions')
                                ->orWhere('type', 'interview')
                                ->first() ?? Category::first();
        }

        if (!$category) {
            return response()->json(['message' => 'No categories found in database to associate questions.'], 400);
        }

        if ($subcategoryId) {
            $subcategory = $category->subcategories()->find($subcategoryId);
        } else {
            $subcategory = null;
            if ($category->slug === 'interview-questions' || $category->type === 'interview') {
                if (in_array($topic, ['react', 'javascript'])) {
                    $subcategory = $category->subcategories()->where('slug', 'frontend-development')->first();
                } else if (in_array($topic, ['python', 'php', 'java', 'cpp'])) {
                    $subcategory = $category->subcategories()->where('slug', 'backend-development')->first();
                }
            }
            if (!$subcategory) {
                $subcategory = $category->subcategories()->first();
            }
        }

        // Branch by source
        if ($source === 'openai' || $source === 'gemini') {
            $provider = $source;
            $envKeyName = $provider === 'openai' ? 'OPENAI_API_KEY' : 'GEMINI_API_KEY';
            $apiKey = env($envKeyName);

            if (!$apiKey || $apiKey === 'your_openai_api_key_here' || $apiKey === 'your_gemini_api_key_here') {
                return response()->json(['message' => ucfirst($provider) . ' API key is not configured. Please set ' . $envKeyName . ' in the backend .env file.'], 400);
            }

            try {
                // Ensure the runtime configuration of Laravel AI is updated with the user's API key
                config(["ai.providers.{$provider}.key" => $apiKey]);

                $prompt = "Generate exactly 10 unique, high-quality technical interview/educational questions about the topic: '{$rawTopic}'. "
                        . "Ensure they are directly related to the topic, accurate, and professional.";

                // Instantiate and prompt our custom Laravel AI agent
                $agent = new \App\Ai\Agents\QuestionGeneratorAgent();
                $response = $agent->prompt($prompt, provider: $provider);

                $questionsToImport = $response->structured['questions'] ?? [];

                if (empty($questionsToImport)) {
                    return response()->json(['message' => 'No questions were returned by ' . ucfirst($provider) . ' AI.'], 502);
                }

                $desiredAmount = 10;
                $importedCount = 0;

                foreach ($questionsToImport as $item) {
                    if (!isset($item['question']) || !isset($item['answer']) || !isset($item['type'])) {
                        continue;
                    }

                    if (Question::where('question_text', $item['question'])->exists()) {
                        continue;
                    }

                    $question = Question::create([
                        'user_id' => $request->user()->id,
                        'category_id' => $category->id,
                        'subcategory_id' => $subcategory ? $subcategory->id : null,
                        'question_text' => $item['question'],
                        'answer_text' => $item['answer'],
                        'type' => $item['type'],
                        'difficulty' => $item['difficulty'] ?? 'medium',
                        'language' => 'en',
                        'status' => 'approved',
                        'metadata' => ['source' => ucfirst($provider) . ' AI SDK (' . $rawTopic . ')'],
                    ]);

                    // Create or sync the tag
                    $tagSlug = \Illuminate\Support\Str::slug($rawTopic);
                    if (empty($tagSlug)) {
                        $tagSlug = md5($rawTopic);
                    }

                    $tag = Tag::firstOrCreate([
                        'slug' => $tagSlug,
                    ], [
                        'name' => $rawTopic,
                        'name_ml' => $rawTopic
                    ]);
                    $question->tags()->sync([$tag->id]);

                    // For MCQs, add options
                    if ($item['type'] === 'mcq' && isset($item['incorrect']) && is_array($item['incorrect'])) {
                        $choices = [];
                        $choices[] = ['text' => $item['answer'], 'correct' => true];
                        foreach ($item['incorrect'] as $inc) {
                            $choices[] = ['text' => $inc, 'correct' => false];
                        }
                        shuffle($choices);
                        foreach ($choices as $c) {
                            $question->options()->create([
                                'option_text' => $c['text'],
                                'is_correct' => $c['correct']
                            ]);
                        }
                    }

                    $importedCount++;
                }

                if ($importedCount === 0) {
                    return response()->json([
                        'message' => 'All ' . ucfirst($provider) . ' AI questions generated for topic "' . $rawTopic . '" are already imported.',
                        'imported_count' => 0
                    ], 200);
                }

                return response()->json([
                    'message' => ucfirst($provider) . ' AI questions on topic "' . $rawTopic . '" imported successfully',
                    'imported_count' => $importedCount
                ], 200);

            } catch (\Exception $e) {
                return response()->json(['message' => ucfirst($provider) . ' AI SDK Error: ' . $e->getMessage()], 502);
            }
        }

        if ($source === 'local') {
            // Read from local JSON database of 1630+ questions
            $jsonPath = database_path('seeders/data/programming_questions.json');
            
            if (file_exists($jsonPath)) {
                $allQuestions = json_decode(file_get_contents($jsonPath), true);
                
                if (is_array($allQuestions) && array_key_exists($topic, $allQuestions)) {
                    $questionsToImport = $allQuestions[$topic];
                    $desiredAmount = 10;
                    $importedCount = 0;

                    // Shuffle the pool so we get random ones each time we fetch
                    shuffle($questionsToImport);

                    foreach ($questionsToImport as $item) {
                        if (Question::where('question_text', $item['question'])->exists()) {
                            continue;
                        }

                        $question = Question::create([
                            'user_id' => $request->user()->id,
                            'category_id' => $category->id,
                            'subcategory_id' => $subcategory ? $subcategory->id : null,
                            'question_text' => $item['question'],
                            'answer_text' => $item['answer'],
                            'type' => $item['type'],
                            'difficulty' => $item['difficulty'],
                            'language' => 'en',
                            'status' => 'approved',
                            'metadata' => ['source' => 'Local Seeder Pool'],
                        ]);

                        // Sync the tag
                        $tagName = ucfirst($topic);
                        if ($topic === 'cpp') {
                            $tagName = 'C++';
                        } else if ($topic === 'typescript') {
                            $tagName = 'TypeScript';
                        } else if ($topic === 'nextjs') {
                            $tagName = 'Next.js';
                        } else if ($topic === 'laravel') {
                            $tagName = 'Laravel';
                        } else if ($topic === 'docker') {
                            $tagName = 'Docker';
                        } else if ($topic === 'kubernetes') {
                            $tagName = 'Kubernetes';
                        } else if ($topic === 'git') {
                            $tagName = 'Git';
                        } else if ($topic === 'angular') {
                            $tagName = 'Angular';
                        } else if ($topic === 'vue') {
                            $tagName = 'Vue';
                        } else if ($topic === 'sql') {
                            $tagName = 'SQL';
                        }
                        
                        $tag = Tag::firstOrCreate([
                            'slug' => $topic,
                        ], [
                            'name' => $tagName,
                            'name_ml' => $tagName
                        ]);
                        $question->tags()->sync([$tag->id]);

                        // For MCQs, add options
                        if ($item['type'] === 'mcq' && isset($item['incorrect'])) {
                            $choices = [];
                            $choices[] = ['text' => $item['answer'], 'correct' => true];
                            foreach ($item['incorrect'] as $inc) {
                                $choices[] = ['text' => $inc, 'correct' => false];
                            }
                            shuffle($choices);
                            foreach ($choices as $c) {
                                $question->options()->create([
                                    'option_text' => $c['text'],
                                    'is_correct' => $c['correct']
                                ]);
                            }
                        }

                        $importedCount++;
                        if ($importedCount >= $desiredAmount) {
                            break;
                        }
                    }

                    if ($importedCount === 0) {
                        return response()->json([
                            'message' => 'All available ' . ucfirst($topic) . ' questions are already imported.',
                            'imported_count' => 0
                        ], 200);
                    }

                    return response()->json([
                        'message' => ucfirst($topic) . ' questions imported successfully',
                        'imported_count' => $importedCount
                    ], 200);
                } else {
                    return response()->json(['message' => 'Topic "' . $rawTopic . '" not found in local seed pool.'], 404);
                }
            } else {
                return response()->json(['message' => 'Local seed database file not found.'], 500);
            }
        }

        if ($source === 'opentdb') {
            // Default fallback to Open Trivia CS trivia
            $desiredAmount = 10;
            $importedCount = 0;
            $attempts = 0;
            $maxAttempts = 8;

            // Get or generate session token for OpenTDB
            $token = \Illuminate\Support\Facades\Cache::remember('opentdb_session_token', 14400, function () {
                $tokenResponse = \Illuminate\Support\Facades\Http::get('https://opentdb.com/api_token.php?command=request');
                return $tokenResponse->successful() ? ($tokenResponse->json()['token'] ?? null) : null;
            });

            // Create the default tag for General CS questions
            $tag = Tag::firstOrCreate([
                'slug' => 'computer-science',
            ], [
                'name' => 'Computer Science',
                'name_ml' => 'കമ്പ്യൂട്ടർ സയൻസ്'
            ]);

            while ($importedCount < $desiredAmount && $attempts < $maxAttempts) {
                $attempts++;
                
                $url = 'https://opentdb.com/api.php?amount=15&category=18&type=multiple';
                if ($token) {
                    $url .= '&token=' . $token;
                }

                $response = \Illuminate\Support\Facades\Http::get($url);
                if (!$response->successful()) {
                    break;
                }

                $data = $response->json();
                $responseCode = $data['response_code'] ?? -1;

                if ($responseCode === 4) {
                    // Token Empty (exhausted questions). Reset token and retry.
                    \Illuminate\Support\Facades\Cache::forget('opentdb_session_token');
                    $token = null;
                    continue;
                }

                if ($responseCode !== 0) {
                    break;
                }

                $results = $data['results'] ?? [];
                foreach ($results as $item) {
                    $questionText = html_entity_decode($item['question'], ENT_QUOTES, 'UTF-8');
                    $correctAnswer = html_entity_decode($item['correct_answer'], ENT_QUOTES, 'UTF-8');

                    if (Question::where('question_text', $questionText)->exists()) {
                        continue;
                    }

                    $question = Question::create([
                        'user_id' => $request->user()->id,
                        'category_id' => $category->id,
                        'subcategory_id' => $subcategory ? $subcategory->id : null,
                        'question_text' => $questionText,
                        'type' => 'mcq',
                        'difficulty' => $item['difficulty'] ?? 'medium',
                        'language' => 'en',
                        'status' => 'approved',
                        'metadata' => ['source' => 'Open Trivia DB'],
                    ]);

                    // Sync the tag
                    $question->tags()->sync([$tag->id]);

                    $choices = [];
                    $choices[] = ['text' => $correctAnswer, 'correct' => true];
                    
                    foreach ($item['incorrect_answers'] as $incAns) {
                        $choices[] = [
                            'text' => html_entity_decode($incAns, ENT_QUOTES, 'UTF-8'),
                            'correct' => false
                        ];
                    }

                    shuffle($choices);

                    foreach ($choices as $choice) {
                        $question->options()->create([
                            'option_text' => $choice['text'],
                            'is_correct' => $choice['correct'],
                        ]);
                    }

                    $importedCount++;
                    if ($importedCount >= $desiredAmount) {
                        break 2;
                    }
                }
            }

            if ($importedCount === 0) {
                return response()->json(['message' => 'No new questions found. All available online questions are already imported.'], 404);
            }

            return response()->json([
                'message' => 'Online questions imported successfully',
                'imported_count' => $importedCount
            ], 200);
        }

        return response()->json(['message' => 'Invalid source selected.'], 400);
    }
}
