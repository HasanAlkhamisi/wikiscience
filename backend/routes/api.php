<?php

use App\Http\Controllers\CategoryController;
use Illuminate\Http\Request;
use Illuminate\Queue\Connectors\SyncConnector;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Models\User;
use App\Http\Controllers\ContentController;
use App\Http\Controllers\SyncController;
use App\Http\Controllers\FavoriteController;

//Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::apiResource('/categories', CategoryController::class);
    Route::apiResource('/contents', ContentController::class);
    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::post('/favorites/{content}', [FavoriteController::class, 'store']);
    Route::delete('/favorites/{content}', [FavoriteController::class, 'destroy']);
    Route::post('/sync/push', [SyncController::class, 'push']);
    Route::get('/sync/pull', [SyncController::class, 'pull']);
    //Route::post('/sync/upload-file', [SyncController::class, 'uploadFile']);
    Route::post('/sync/upload-file', function (Request $request) {
        $request->validate([
            'file' => 'required|image|max:10240'
        ]); // max 10MB
        $path = $request->file('file')->store('uploads', 'public');
        return response()->json(['url' => asset('storage/' . $path)], 201);
    });


    Route::post('/sync/delete-contents', [SyncController::class, 'deleteContents']);
});