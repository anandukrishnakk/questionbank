<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Question;
use App\Models\Category;
use Barryvdh\DomPDF\Facade\Pdf;

class AdminExportController extends Controller
{
    public function exportPdf(Request $request)
    {
        $query = Question::with(['category', 'subcategory', 'options', 'tags'])
                         ->where('status', 'approved');

        // Apply filters
        if ($request->has('category_id') && !empty($request->category_id)) {
            $query->where('category_id', $request->category_id);
        }
        if ($request->has('subcategory_id') && !empty($request->subcategory_id)) {
            $query->where('subcategory_id', $request->subcategory_id);
        }
        if ($request->has('difficulty') && !empty($request->difficulty)) {
            $query->where('difficulty', $request->difficulty);
        }
        if ($request->has('language') && !empty($request->language)) {
            $query->where('language', $request->language);
        }

        $questions = $query->latest()->get();

        // If no questions found
        if ($questions->isEmpty()) {
            return response()->json(['message' => 'No approved questions found matching the selected filters.'], 404);
        }

        // Build HTML template dynamically
        $html = '
        <!DOCTYPE html>
        <html>
        <head>
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
            <style>
                body {
                    font-family: sans-serif;
                    color: #333;
                    line-height: 1.5;
                    font-size: 13px;
                }
                .header {
                    background-color: #0b1120;
                    color: #ffffff;
                    padding: 25px;
                    text-align: center;
                    border-radius: 6px;
                    margin-bottom: 30px;
                }
                .header h1 {
                    margin: 0;
                    font-size: 24px;
                }
                .header p {
                    margin: 5px 0 0 0;
                    font-size: 12px;
                    color: #94a3b8;
                }
                .question-card {
                    margin-bottom: 25px;
                    padding-bottom: 20px;
                    border-bottom: 1px solid #e2e8f0;
                }
                .q-header {
                    font-size: 11px;
                    text-transform: uppercase;
                    color: #64748b;
                    font-weight: bold;
                    margin-bottom: 6px;
                }
                .q-text {
                    font-size: 14px;
                    font-weight: bold;
                    margin-bottom: 10px;
                    color: #0f172a;
                }
                .options-list {
                    margin-left: 15px;
                    margin-bottom: 10px;
                }
                .option-item {
                    margin-bottom: 4px;
                }
                .correct-option {
                    color: #10b981;
                    font-weight: bold;
                }
                .answer-box {
                    background-color: #f8fafc;
                    border-left: 3px solid #3b82f6;
                    padding: 10px 15px;
                    margin-top: 5px;
                    font-size: 12px;
                    color: #334155;
                }
                .footer {
                    position: fixed;
                    bottom: 0;
                    width: 100%;
                    text-align: center;
                    font-size: 10px;
                    color: #94a3b8;
                    border-top: 1px solid #e2e8f0;
                    padding-top: 10px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Universal Question Bank</h1>
                <p>Generated on ' . date('Y-m-d H:i') . '</p>
            </div>
        ';

        foreach ($questions as $index => $q) {
            $catName = $q->category ? $q->category->name : 'General';
            $subcatName = $q->subcategory ? ' > ' . $q->subcategory->name : '';
            $difficulty = strtoupper($q->difficulty);

            $html .= '<div class="question-card">';
            $html .= '<div class="q-header">' . ($index + 1) . '. ' . $catName . $subcatName . ' [' . $difficulty . '] (' . strtoupper($q->language) . ')</div>';
            
            // Question translations
            $html .= '<div class="q-text">' . htmlspecialchars($q->question_text) . '</div>';
            if ($q->question_text_ml) {
                $html .= '<div class="q-text" style="color:#475569; font-weight:normal;">' . htmlspecialchars($q->question_text_ml) . '</div>';
            }

            // Options if MCQ
            if ($q->type === 'mcq' && $q->options) {
                $html .= '<div class="options-list">';
                foreach ($q->options as $opt) {
                    $optText = htmlspecialchars($opt->option_text);
                    if ($opt->option_text_ml) {
                        $optText .= ' (' . htmlspecialchars($opt->option_text_ml) . ')';
                    }

                    if ($opt->is_correct) {
                        $html .= '<div class="option-item correct-option">[CORRECT] ' . $optText . '</div>';
                    } else {
                        $html .= '<div class="option-item">[ ] ' . $optText . '</div>';
                    }
                }
                $html .= '</div>';
            }

            // Answer/Explanation if Descriptive
            if ($q->type === 'descriptive' && ($q->answer_text || $q->answer_text_ml)) {
                $html .= '<div class="answer-box">';
                $html .= '<strong>Answer:</strong><br/>';
                if ($q->answer_text) {
                    $html .= nl2br(htmlspecialchars($q->answer_text)) . '<br/>';
                }
                if ($q->answer_text_ml) {
                    $html .= '<span style="color:#475569;">' . nl2br(htmlspecialchars($q->answer_text_ml)) . '</span>';
                }
                $html .= '</div>';
            }

            $html .= '</div>';
        }

        $html .= '
            <div class="footer">
                Universal Question Bank &copy; ' . date('Y') . ' | Page 1
            </div>
        </body>
        </html>
        ';

        // Initialize and stream DomPDF
        $pdf = Pdf::loadHTML($html);
        return $pdf->download('questionbank-export-' . date('Ymd-His') . '.pdf');
    }
}
