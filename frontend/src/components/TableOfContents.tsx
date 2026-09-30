"use client"
import { useEffect, useState } from "react"
import {
  ChevronRight,
  FileText,
  Image as ImageIcon,
  BookText,
  List as ListIcon,
} from "lucide-react"
import { Content } from "@/types"
import api from "@/lib/api"

interface Props {
  categoryId: number
  refreshKey: number
  // compact: قسم قابل للطي (الدرج/الشريط الأيسر) - panel: عمود يمين مفتوح دائمًا
  variant?: "compact" | "panel"
}

export default function TableOfContents({
  categoryId,
  refreshKey,
  variant = "compact",
}: Props) {
  const [contents, setContents] = useState<Content[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get<Content[]>("/contents", {
          params: { category_id: categoryId },
        })
        setContents(data)
      } catch (err) {
        console.error("Failed to load contents:", err)
      }
    }
    load()
  }, [categoryId, refreshKey])

  // scroll to the top of the matching content block by its DOM id
  function scrollToContent(id: number) {
    const el = document.getElementById(`content-${id}`)
    el?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  function renderItems() {
    return (
      <>
        {contents.map((item) => {
          // صور مصغّرة على طريقة الموسوعات لعناصر الصور
          const thumb =
            item.type === "image" && item.file_path
              ? `${process.env.NEXT_PUBLIC_STORAGE_URL}/${item.file_path}`
              : null

          return (
            <li key={item.id}>
              <button
                onClick={() => scrollToContent(item.id)}
                className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-muted-foreground transition hover:bg-accent hover:text-primary"
              >
                {thumb ? (
                  <img
                    src={thumb}
                    alt=""
                    loading="lazy"
                    className="aspect-square w-1/4 max-w-16 min-w-10 shrink-0 rounded border border-border object-cover"
                  />
                ) : item.type === "article" ? (
                  <FileText className="h-4 w-4 shrink-0" />
                ) : item.type === "image" ? (
                  <ImageIcon className="h-4 w-4 shrink-0" />
                ) : (
                  <BookText className="h-4 w-4 shrink-0" />
                )}
                <span
                  className={
                    thumb
                      ? "line-clamp-2 min-w-0 break-words"
                      : "min-w-0 truncate"
                  }
                >
                  {item.title}
                </span>
              </button>
            </li>
          )
        })}
      </>
    )
  }

  if (variant === "panel") {
    return (
      <div className=" flex min-h-0 flex-1 flex-col">
        <h3 className="flex items-center gap-2 px-4 pt-2 pb-2 font-serif text-sm font-bold text-primary">
          <ListIcon className="h-4 w-4 shrink-0 " />
          index of Contents
          <span className="font-sans text-xs font-normal text-muted-foreground">
            ({contents.length})
          </span>
        </h3>
        {contents.length === 0 ? (
          <p className="px-4 text-xs text-muted-foreground">
            There are No Index{" "}
          </p>
        ) : (
          <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 pb-4 text-sm">
            {renderItems()}
          </ul>
        )}
      </div>
    )
  }

  if (contents.length === 0) return null

  return (
    <details
      open={open}
      onToggle={(e) => setOpen(e.currentTarget.open)}
      className="group shrink-0 border-t border-border bg-background"
    >
      <summary className=" flex cursor-pointer list-none items-center gap-2 px-4 py-3 font-serif text-sm font-bold text-primary select-none">
        <ChevronRight className=" h-4 w-4 shrink-0 transition-transform group-open:rotate-90" />
        index of Contents
        <span className="font-sans text-xs font-normal text-muted-foreground">
          ({contents.length})
        </span>
      </summary>

      <ul className="max-h-48 space-y-1 overflow-y-auto px-4 pb-4 text-sm">
        {renderItems()}
      </ul>
    </details>
  )
}
