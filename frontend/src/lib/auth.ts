
import api from '@/lib/api';

const TOKEN_KEY = 'auth_token';

// دوال مساعدة صغيرة لقراءة/كتابة/حذف Cookie من جهة المتصفح فقط
// (لا نحتاج مكتبة خارجية مثل js-cookie لهذا الاستخدام البسيط)
function setCookie(name: string, value: string, days = 7) {
  const maxAge = days * 24 * 60 * 60;
  // SameSite=Lax كافٍ هنا لأن الطلب من نفس الموقع (Middleware + الصفحات)
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0`;
}

export async function login(email: string, password: string) {
  const { data } = await api.post('/login', { email, password });
  setCookie(TOKEN_KEY, data.token);
  return data;
}

export async function register(
  name: string,
  email: string,
  password: string,
  passwordConfirmation: string
) {
  const { data } = await api.post('/register', {
    name,
    email,
    password,
    password_confirmation: passwordConfirmation,
  });
  // لو رجّع الـ backend توكن نسجّل الدخول مباشرة، وإلا نسجّل الدخول بالبيانات نفسها
  if (data?.token) {
    setCookie(TOKEN_KEY, data.token);
    return data;
  }
  return login(email, password);
}

export function isLoggedIn(): boolean {
  // تُستخدم فقط داخل Client Components (لا تعمل على السيرفر)
  return document.cookie
    .split('; ')
    .some((row) => row.startsWith(`${TOKEN_KEY}=`));
}

export async function logout() {
  deleteCookie(TOKEN_KEY);
}