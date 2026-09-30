"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// صورة مصغّرة على طريقة الموسوعات: تُعرض بحجم صغير (العرض يحدده className)،
// وبالضغط عليها تُفتح مكبّرة في نافذة.
export default function ImageThumb({
  src,
  alt,
  className,
}: {
  src: string
  alt: string
  className?: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="تكبير الصورة"
        className={cn(
          "not-prose block cursor-zoom-in overflow-hidden rounded-md border border-border bg-muted p-0.5 transition hover:border-primary",
          className
        )}
      >
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="m-0 block h-auto w-full rounded-sm object-cover"
        />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{alt || "صورة"}</DialogTitle>
          </DialogHeader>
          <img
            src={src}
            alt={alt}
            className="max-h-[75dvh] w-full rounded object-contain"
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
