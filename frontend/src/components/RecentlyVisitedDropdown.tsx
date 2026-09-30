"use client"

import { useState } from "react"
import { ChevronDownIcon, HistoryIcon, TagIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Category } from "@/types"
import { cn } from "@/lib/utils"

interface RecentlyVisitedDropdownProps {
  categories: Category[] // الأحدث أولًا
  selectedCategoryId?: number | null
  onSelectCategory: (category: Category) => void
}

export function RecentlyVisitedDropdown({
  categories,
  selectedCategoryId,
  onSelectCategory,
}: RecentlyVisitedDropdownProps) {
  const [open, setOpen] = useState(false)

  function handleSelect(category: Category) {
    setOpen(false)
    onSelectCategory(category)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            aria-label="آخر التصنيفات التي تمت زيارتها"
          />
        }
      >
        <HistoryIcon className="size-4" />
        <span className="hidden sm:inline">Recent</span>
        <ChevronDownIcon className="size-4 opacity-60" />
      </PopoverTrigger>

      <PopoverContent align="end" className="w-72 max-w-[calc(100vw-1.5rem)]">
        {/* The header is forced LTR, so restore RTL for the Arabic list */}
        <div dir="rtl" className="max-h-80 overflow-y-auto">
          {categories.length === 0 ? (
            <p className="p-2 text-xs text-muted-foreground">
              لم تزر أي تصنيف بعد
            </p>
          ) : (
            <div className="flex flex-col gap-1">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleSelect(category)}
                  className={cn(
                    "flex items-center gap-2 rounded-md p-2 text-start text-sm transition hover:bg-accent",
                    selectedCategoryId === category.id &&
                      "bg-accent font-medium"
                  )}
                >
                  <TagIcon className="size-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">{category.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
