<?php

namespace App\Http\Controllers;
use App\Models\Content;
use App\Models\Category;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

use Illuminate\Http\Request;

class SyncController extends Controller
{
    //
    private int $maxAttempts = 10;
    public function push(Request $request)
    {
        $request->validate([
            'categories' => 'array',
            'categories.*.local_id' => 'required|string',
            'categories.*.name' => 'required|string',
            'categories.*.parent_local_id' => 'nullable|string',

            'items' => 'array',
            'items.*.local_id' => 'required|string',
            'items.*.category_local_id' => 'required|string',
            'items.*.title' => 'required|string',
            'items.*.type' => 'required|in:article,image,video,pdf,audio',
        ]);
        $user = $request->user();
        $categories = $request->input('categories', []);
        $items = $request->input('items', []);
        $syncedCats = [];
        $syncedItems = [];
        $failedCats = [];

        DB::transaction(function () use ($categories, $items, $user, &$syncedCats, &$syncedItems, &$failedCats) {
            $pending = collect($categories);
            $attempt = 0;
            $maxAttempts = 10; // Set a maximum number of attempts to avoid infinite loops  
            while ($pending->isNotEmpty() && $attempt < $maxAttempts) {
                $stillPending = collect();
                foreach ($pending as $cat) {
                    $parentId = null;
                    if (!empty($cat['parent_local_id'])) {
                        $parentId = Category::where('local_id', $cat['parent_local_id'])->where('user_id', $user->id)->value('id');

                        if (!$parentId) {
                            $stillPending->push($cat);
                            continue;
                        }
                    }
                    $category = Category::updateOrCreate(
                        ['local_id' => $cat['local_id'], 'user_id' => $user->id],
                        ['name' => $cat['name'], 'parent_id' => $parentId]
                    );
                    $syncedCats[] = [
                        'local_id' => $category->local_id,
                        'server_id' => $category->id,
                        'updated_at' => $category->updated_at,
                    ];
                }
                $pending = $stillPending;
                $attempt++;
            }
            if ($pending->isNotEmpty()) {
                Log::warning('Some categories could not be synced after maximum attempts: ', [
                    'user_id' => $user->id,
                    'pending' => $pending->toArray(),
                ]);
                $failedCats = $pending->pluck('local_id')->toArray();
            }
            foreach ($items as $item) {

                // Ensure the category exists for the item
                $categoryId = Category::where('local_id', $item['category_local_id'])->where('user_id', $user->id)->value('id');
                if (!$categoryId) {
                    Log::warning('Category not found for item: ', ['item' => $item]);
                    continue; // Skip this item if the category doesn't exist
                }

                // Create or update the content item
                $content = Content::updateOrCreate(
                    ['local_id' => $item['local_id'], 'user_id' => $user->id],
                    [
                        'category_id' => $categoryId,
                        'title' => $item['title'],
                        'type' => $item['type'],
                        'body' => $item['body'] ?? null,
                        'file_path' => $item['file_path'] ?? null,

                    ]
                );
                $syncedItems[] = [
                    'local_id' => $content->local_id,
                    'server_id' => $content->id,
                    'updated_at' => $content->updated_at,


                ];


            }
        });

        return response()->json([
            'categories' => $syncedCats,
            'items' => $syncedItems,
            'failed_categories' => $failedCats,
            'server_time' => now(),
        ]);



    }


    public function pull(Request $request)
    {
        $user = $request->user();
        $lastSync = $request->input('last_sync_id', '1970-01-01');
        $categories = Category::where('user_id', $user->id)
            ->where('updated_at', '>', $lastSync)
            ->get()
            ->map(fn($c) => [
                'server_id' => $c->id,
                'local_id' => $c->local_id,
                'name' => $c->name,
                'parent_local_id' => $c->parent_id
                    ? Category::find($c->parent_id)?->local_id
                    : null,
                'updated_at' => $c->updated_at,
            ]);

        $items = Content::where('user_id', $user->id)
            ->where('updated_at', '>', $lastSync)
            ->get()
            ->map(fn($i) => [
                'server_id' => $i->id,
                'local_id' => $i->local_id,
                'category_local_id' => Category::find($i->category_id)?->local_id,
                'title' => $i->title,
                'type' => $i->type,
                'file_path' => $i->file_path,
                'updated_at' => $i->updated_at,
                'body' => $i->body,

            ]);
        return response()->json([
            'categories' => $categories,
            'items' => $items,
            'server_time' => now(),
        ]);

    }

    public function uploadFile(Request $request)
    {
        $request->validate([
            'local_id' => 'required|string',
            'file' => 'required|file|max:10240',
        ]);
        $user = $request->user();
        $content = Content::where('local_id', $request->local_id)
            ->where('user_id', $user->id)
            ->first();
        if (!$content) {
            return response()->json(['message' => 'المحتوى غير موجود زامن النص أولا'], 404);
        }
        if ($content->file_path) {
            \Storage::disk('public')->delete($content->file_path);

        }
        $path = $request->file('file')->store('uploads', 'public');
        $content->update(['file_path' => $path]);
        return response()->json([
            'local_id' => $content->local_id,
            'file_path' => $path,
        ]);

    }

    public function deleteContents(Request $request)
    {
        $request->validate([
            'local_ids' => 'required|array'
        ]);
        $user = $request->user();
        Content::where('user_id', $user->id)
            ->whereIn('local_id', $request->local_ids)
            ->delete();

        return response()->json(['deleted' => $request->local_ids]);
    }
}
