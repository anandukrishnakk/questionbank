<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\QuestionController;

// Public routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{id}', [CategoryController::class, 'show']);
Route::get('/tags', [TagController::class, 'index']);

Route::get('/questions', [QuestionController::class, 'index']);
Route::get('/questions/{id}', [QuestionController::class, 'show']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    
    Route::post('/questions', [QuestionController::class, 'store']);
    Route::put('/questions/{id}', [QuestionController::class, 'update']);
    Route::delete('/questions/{id}', [QuestionController::class, 'destroy']);
    Route::post('/questions/{id}/images', [QuestionController::class, 'uploadImage']);
    
    // Admin routes (requires admin middleware alias)
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/stats', [\App\Http\Controllers\Admin\AdminQuestionController::class, 'stats']);
        Route::patch('/questions/{id}/approve', [\App\Http\Controllers\Admin\AdminQuestionController::class, 'approve']);
        Route::patch('/questions/{id}/reject', [\App\Http\Controllers\Admin\AdminQuestionController::class, 'reject']);
        
        Route::get('/users', [\App\Http\Controllers\Admin\AdminUserController::class, 'index']);
        Route::patch('/users/{id}/role', [\App\Http\Controllers\Admin\AdminUserController::class, 'updateRole']);
        
        Route::get('/export/pdf', [\App\Http\Controllers\Admin\AdminExportController::class, 'exportPdf']);
        Route::post('/fetch-online', [\App\Http\Controllers\Admin\AdminQuestionController::class, 'fetchOnline']);
    });
});
