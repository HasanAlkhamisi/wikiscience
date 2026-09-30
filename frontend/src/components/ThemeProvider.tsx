"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// يضيف/يزيل الكلاس "dark" على <html> ويحفظ الاختيار في localStorage.
// defaultTheme="system": أول زيارة تتبع إعداد نظام المستخدم.
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
