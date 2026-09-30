<?php

namespace App\Http\Controllers;
use App\Models\Category;
use Illuminate\Http\Request;
use App\Http\Controllers\AuthController;
class CategoryController extends Controller
{
    //

    public function index(Request $request)
    {
        return Category::with('children.children')
            ->where('user_id', $request->user()->id)
            ->whereNull('parent_id')->get();

    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:categories,id',
        ]);

        if (!empty($data['parent_id'])) {
            $parent = Category::findOrFail($data['parent_id']);
            if ($parent->depth() >= 2) {
                abort(422, 'Cannot create a category more than 3 levels deep.');
            }
        }

        $data['local_id'] = (string) \Illuminate\Support\Str::uuid();
        $data['user_id'] = $request->user()->id;

        return Category::create($data);
    }

    public function show(Request $request, $id)
    {
        $category = Category::with('children.children')->findOrFail($id);
        if ($category->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized action.');
        }
        return $category;
    }


    public function update(Request $request, Category $category)
    {
        $this->authorizeOwner($category, $request);
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:categories,id',
        ]);



        if (array_key_exists('parent_id', $data) && $data['parent_id'] !== null) {
            $newParent = Category::findOrFail($data['parent_id']);
            abort_if($newParent->user_id !== $request->user()->id, 403, 'UnAuthorized action.');
            abort_if($newParent->id == $category->id, 422, 'Cannot set a category as parent of itself.');
            abort_if($newParent->parent_id == $category->id, 422, 'Cannot set a category as its own parent.');
            abort_if($newParent->depth() >= 2, 402, $request->user()->name . ', Cannot create a category more than 3 levels deep.');
        }


        $category->update($data);
        return $category;
    }



    public function destroy(Request $request, Category $category)
    {
        $this->authorizeOwner($category, $request);
        if ($category->children()->exists()) {
            abort(400, 'Cannot delete a category that has subcategories.');
        }
        if ($category->contents()->exists()) {
            abort(400, 'Cannot delete a category that has contents.');
        }
        $category->delete();
        return response()->noContent();
    }
    private function authorizeOwner(Category $category, Request $request)
    {

        abort_if($category->user_id !== $request->user()->id, 403, 'Unauthorized action.');

    }
}

