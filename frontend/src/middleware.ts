import { NextRequest, NextResponse } from "next/server"
const TOKEN_COOKIE = "auth_token"

// المسارات التي تتطلب تسجيل دخول
const PROTECTED_PREFIXES = ["/dashboard"]
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasToken = request.cookies.has(TOKEN_COOKIE)

  // الصفحة الرئيسية "/" ليست صفحة محتوى، فقط نقطة توجيه
  if (pathname === "/") {
    const dest = hasToken ? "/dashboard" : "/login"
    return NextResponse.redirect(new URL(dest, request.url))
  }

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))
  const isLoginPage =
    pathname.startsWith("/login") || pathname.startsWith("/register")

  // محاولة دخول صفحة محمية بدون توكن -> إعادة توجيه فورية لتسجيل الدخول
  if (isProtected && !hasToken) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // مستخدم مسجّل دخول بالفعل يحاول فتح صفحة تسجيل الدخول -> توجيهه للوحة التحكم
  if (isLoginPage && hasToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

// تحديد المسارات التي يعمل عليها الـ Middleware فقط (لتحسين الأداء)
export const config = {
  matcher: ["/", "/dashboard/:path*", "/login", "/register"],
}
