"use client"

import { useState } from "react"
import { ChevronDownIcon, Heart } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import FavoritesPanel from "@/components/FavoritesPanel"

interface FavoritesDropdownProps {
  refreshKey: number
  onSelectContent: (contentId: number, categoryId: number) => void
}

export function FavoritesDropdown({
  refreshKey,
  onSelectContent,
}: FavoritesDropdownProps) {
  const [open, setOpen] = useState(false)

  // Close the dropdown first, then let the parent navigate to the content
  function handleSelect(contentId: number, categoryId: number) {
    setOpen(false)
    onSelectContent(contentId, categoryId)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={<Button variant="outline" size="sm" className="gap-1.5" />}
      >
        <Heart className="size-4 fill-yellow-400 text-yellow-400" />
        <span className="hidden sm:inline">Favorites</span>
        <ChevronDownIcon className="size-4 opacity-60" />
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 max-w-[calc(100vw-1.5rem)]">
        {/* The header is forced LTR, so restore RTL for the Arabic list */}
        <div dir="rtl" className="max-h-80 overflow-y-auto">
          <FavoritesPanel
            refreshKey={refreshKey}
            onSelectContent={handleSelect}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
