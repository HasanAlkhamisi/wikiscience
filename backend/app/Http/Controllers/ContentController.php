<?php

namespace App\Http\Controllers;
use App\Models\Content;
use App\Models\Category;
use Illuminate\Http\Request;

class ContentController extends Controller
{
    //
    public function index(Request $request)
    {
        $query = Content::where('user_id', $request->user()->id);
        if ($request->has('category_id')) {
            $query->where('category_id', $request->input('category_id'));
        }
        return $query->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'type' => 'required|string|max:255',
            'title' => 'required|string|max:255',
            'body' => 'nullable|string',
            'file_path' => 'nullable|string|max:255',
        ]);
        $category = Category::findOrFail($data['category_id']);
        abort_if($category->user_id !== $request->user()->id, 403, 'Unauthorized action.');
        if ($request->hasFile('file')) {
            $data['file_path'] = $request->file('file')->store('uploads', 'public');

        }
        $data['local_id'] = (string) \Illuminate\Support\Str::uuid();
        $data['user_id'] = $request->user()->id;

        return Content::create($data);
    }



    public function update(Request $request, Content $content)
    {
        $this->authorizeOwner($content, $request);
        $data = $request->validate([

            'title' => 'nullable|string|max:255',
            'body' => 'nullable|string',

        ]);
        if ($request->hasFile('file')) {
            $data['file_path'] = $request->file('file')->store('uploads', 'public');
        }
        if (isset($data['category_id'])) {
            $category = Category::findOrFail($data['category_id']);
            abort_if($category->user_id !== $request->user()->id, 403, 'Unauthorized action.');
        }
        $content->update($data);
        return $content;
    }



    public function destroy(Request $request, Content $content)
    {

        $this->authorizeOwner($content, $request);

        if ($content->file_path && \Storage::disk('public')->exists($content->file_path)) {
            \Storage::disk('public')->delete($content->file_path);
        }
        $content->delete();
        return response()->noContent();

    }
    private function authorizeOwner(Content $content, Request $request)
    {

        abort_if($content->user_id !== $request->user()->id, 403, 'Unauthorized action.');

    }
}
