<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('favorites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('content_id')->constrained()->onDelete('cascade');
            $table->timestamps();

            // يمنع تكرار نفس المحتوى بمفضلة نفس المستخدم مرتين على مستوى
            // قاعدة البيانات نفسها، مو فقط بمنطق التطبيق - أضمن.
            $table->unique(['user_id', 'content_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('favorites');
    }
};
