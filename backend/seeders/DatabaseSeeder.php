<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // حساب تجريبي للتقييم فقط (آمن لإعادة التنفيذ أكثر من مرة)
        User::firstOrCreate(
            ['email' => 'teacher@example.com'],
            ['name' => 'Teacher', 'password' => Hash::make('Teacher@123')]
        );
    }
}
