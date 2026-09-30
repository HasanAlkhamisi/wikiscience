
Next.js & Laravel 
WikiScience

WikiScience تطبيق ويب على شكل موسوعة علمية شخصية: يسجّل المستخدم دخوله، ثم يتصفح شجرة من التصنيفات، ويضيف محتوى (مقالات بصيغة Markdown، صور، ملفات)، ويحفظ ما يريد في المفضلة. الواجهة مبنية بـ Next.js وتتحدث مع REST API مكتوب بـ Laravel (مع Sanctum للمصادقة) يعمل على 127.0.0.1:8000.
  frontend/   واجهة Next.js
  backend/    Laravel API
```
## المتطلبات
| البرنامج           | ملاحظة                              |
| ------------------ | ----------------------------------- |
| Node.js 20 أو أحدث | https://nodejs.org                  |
| XAMPP              | يوفّر PHP 8.2+ و MySQL و phpMyAdmin |
| Composer           | https://getcomposer.org             |

> تأكد أن أمرَي `php` و`composer` يعملان في الـ Terminal.
> إن لم يعمل `php` فأضف `C:\xampp\php` إلى متغير PATH.

## 1) إنشاء قاعدة البيانات

1. شغّل **XAMPP Control Panel** ثم اضغط **Start** بجانب **Apache** و**MySQL**.
2. افتح http://localhost/phpmyadmin
3. من **New** أنشئ قاعدة اسمها `wikiscience` والترميز `utf8mb4_unicode_ci`.

## 2) تشغيل الخادم (Terminal 1)

```
cd backend
composer install
copy .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve
```

(على macOS/Linux استخدم `cp` بدل `copy`.)

يعمل الخادم على http://127.0.0.1:8000

## 3) تشغيل الواجهة (Terminal 2 - اتركه مفتوحاً)

```
cd frontend
npm install
copy .env.example .env.local
npm run dev
```

## 4) الاستخدام

افتح http://localhost:3000 وسجّل الدخول بالحساب التجريبي:


## مشاكل شائعة

| المشكلة                          | الحل                                                                                   |
| -------------------------------- | -------------------------------------------------------------------------------------- |
| `Access denied for user 'root'`  | تأكد من `DB_USERNAME` و`DB_PASSWORD` في `backend/.env`                                 |
| `Unknown database 'wikiscience'` | أنشئ القاعدة من phpMyAdmin (الخطوة 1)                                                  |
| `could not find driver`          | فعّل `extension=pdo_mysql` في `C:\xampp\php\php.ini` ثم أعد التشغيل                    |
| الواجهة لا تجلب البيانات         | تأكد أن `php artisan serve` يعمل، وأن `frontend/.env.local` موجود ثم أعد `npm run dev` |
| الصور لا تظهر                    | نفّذ `php artisan storage:link`                                                        |

---
WikiScience

تشغيل الخادم (Terminal 1)
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve

تشغيل الواجهة (Terminal 2)
cd frontend
npm install
cp .env.example .env.local
npm run dev
