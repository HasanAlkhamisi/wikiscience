"use client"

import { useMemo } from "react"
import { cn } from "@/lib/utils"
import { Category } from "@/types"

const MAX_ITEMS = 5

interface RecentMainCategoriesProps {
  categories: Category[]
  selectedCategoryId?: number | null
  onSelectCategory: (category: Category) => void
}

function toTimestamp(value?: string): number {
  const parsed = value ? Date.parse(value) : NaN
  return Number.isNaN(parsed) ? 0 : parsed
}

export function RecentMainCategories({
  categories,
  selectedCategoryId,
  onSelectCategory,
}: RecentMainCategoriesProps) {
  // Newest first by created_at, falling back to id when dates are missing or equal
  const recent = useMemo(
    () =>
      categories
        .filter((category) => category.parent_id === null)
        .sort(
          (a, b) =>
            toTimestamp(b.created_at) - toTimestamp(a.created_at) || b.id - a.id
        )
        .slice(0, MAX_ITEMS),
    [categories]
  )

  if (recent.length === 0) return null

  return (
    <nav className="flex h-full min-w-0 items-stretch overflow-x-auto">
      {recent.map((category) => {
        const isSelected = selectedCategoryId === category.id
        return (
          <button
            key={category.id}
            type="button"
            title={category.name}
            onClick={() => onSelectCategory(category)}
            className={cn(
              " relative max-w-40 shrink-0 cursor-pointer px-5 font-mono text-xs tracking-widest text-muted-foreground uppercase transition-colors hover:text-foreground",
              isSelected &&
                "text-primary after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-primary"
            )}
          >
            <span className="block truncate">{category.name}</span>
          </button>
        )
      })}
    </nav>
  )
}
