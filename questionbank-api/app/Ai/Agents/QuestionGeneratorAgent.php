<?php

namespace App\Ai\Agents;

use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\Conversational;
use Laravel\Ai\Contracts\HasTools;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Messages\Message;
use Laravel\Ai\Promptable;
use Stringable;

use Laravel\Ai\Contracts\HasStructuredOutput;
use Illuminate\Contracts\JsonSchema\JsonSchema;

class QuestionGeneratorAgent implements Agent, Conversational, HasTools, HasStructuredOutput
{
    use Promptable;

    /**
     * Get the instructions that the agent should follow.
     */
    public function instructions(): Stringable|string
    {
        return 'You are an expert technical interviewer and educator. You generate highly accurate educational questions in a strict JSON format matching the schema. Provide clear, professional questions.';
    }

    /**
     * Define the structure the AI must return.
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'questions' => $schema->array()->items(
                $schema->object([
                    'question' => $schema->string()->required(),
                    'answer' => $schema->string()->required(),
                    'type' => $schema->string()->enum(['mcq', 'descriptive'])->required(),
                    'difficulty' => $schema->string()->enum(['easy', 'medium', 'hard'])->required(),
                    'incorrect' => $schema->array()->items($schema->string()) // Array of 3 incorrect answers if type is mcq
                ])
            )->required(),
        ];
    }

    /**
     * Get the list of messages comprising the conversation so far.
     *
     * @return Message[]
     */
    public function messages(): iterable
    {
        return [];
    }

    /**
     * Get the tools available to the agent.
     *
     * @return Tool[]
     */
    public function tools(): iterable
    {
        return [];
    }
}

