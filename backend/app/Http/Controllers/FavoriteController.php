<?php

namespace App\Http\Controllers;

use App\Models\Content;
use App\Models\Favorite;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    // قائمة المحتويات المفضّلة لدى المستخدم الحالي (وليس سجلات Favorite
    // نفسها) - لأن الواجهة تحتاج تعرض المحتوى مباشرة بنفس شكل ContentBlock
    // الموجود أصلًا، بدون تحويل إضافي بجهة الفرونت.
    public function index(Request $request)
    {
        return Content::whereHas('favorites', function ($query) use ($request) {
            $query->where('user_id', $request->user()->id);
        })->latest('id')->get();
    }

    public function store(Request $request, Content $content)
    {
        $this->authorizeOwner($content, $request);

        // firstOrCreate يمنع خطأ Unique Constraint لو ضغط المستخدم
        // على الزر مرتين بسرعة (نقرة مزدوجة، إعادة إرسال الطلب... إلخ).
        Favorite::firstOrCreate([
            'user_id' => $request->user()->id,
            'content_id' => $content->id,
        ]);

        return response()->noContent();
    }

    public function destroy(Request $request, Content $content)
    {
        $this->authorizeOwner($content, $request);

        Favorite::where('user_id', $request->user()->id)
            ->where('content_id', $content->id)
            ->delete();

        return response()->noContent();
    }

    private function authorizeOwner(Content $content, Request $request)
    {
        abort_if($content->user_id !== $request->user()->id, 403, 'Unauthorized action.');
    }
}
