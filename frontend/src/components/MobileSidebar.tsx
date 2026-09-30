"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MobileSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: React.ReactNode
}

// درج جانبي للشاشات الصغيرة (يحلّ محل الـ aside المخفي تحت md).
// مبني على Dialog الخاص بـ base-ui فيحصل تلقائيًا على: حبس التركيز،
// الإغلاق بـ Escape، والإغلاق بالضغط على الخلفية.
export function MobileSidebar({
  open,
  onOpenChange,
  title,
  children,
}: MobileSidebarProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/40 duration-150 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 md:hidden" />
        <DialogPrimitive.Popup
          className="fixed inset-y-0 left-0 z-50 flex w-[min(20rem,85vw)] flex-col border-r bg-background text-foreground shadow-xl outline-none duration-200 data-open:animate-in data-open:slide-in-from-left data-closed:animate-out data-closed:slide-out-to-left md:hidden"
        >
          <div className="flex h-16 shrink-0 items-center justify-between border-b px-3">
            <DialogPrimitive.Title className="text-base font-semibold">
              {title}
            </DialogPrimitive.Title>
            <DialogPrimitive.Close
              render={<Button variant="ghost" size="icon-sm" />}
            >
              <XIcon />
              <span className="sr-only">إغلاق</span>
            </DialogPrimitive.Close>
          </div>
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            {children}
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
