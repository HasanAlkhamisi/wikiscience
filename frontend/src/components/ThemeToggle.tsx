"use client"

import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

// مفتاح (switch) على شكل حبة: الدائرة تنزلق يمينًا في الوضع الليلي.
// الحالة تُعرض بكلاسات dark: فقط، فلا يحدث hydration mismatch.
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <button
      type="button"
      role="switch"
      aria-checked={resolvedTheme === "dark"}
      aria-label="تبديل الوضع الليلي / النهاري"
      title="تبديل الوضع الليلي / النهاري"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className={cn(
        "relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border border-border bg-muted p-0.5 transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className
      )}
    >
      <span className="flex size-5.5 translate-x-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow transition-transform duration-200 dark:translate-x-5">
        <SunIcon className="size-3.5 dark:hidden" />
        <MoonIcon className="hidden size-3.5 dark:block" />
      </span>
    </button>
  )
}
