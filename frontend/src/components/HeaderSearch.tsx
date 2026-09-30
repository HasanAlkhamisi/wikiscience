"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { SearchIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Category } from "@/types"

const MAX_RESULTS = 8

interface HeaderSearchProps {
  categories: Category[]
  onSelectCategory: (category: Category) => void
  className?: string
}

interface SearchEntry {
  category: Category
  path: string
}

// Flatten the nested tree into a list with a readable breadcrumb path
function flattenTree(nodes: Category[], parents: string[] = []): SearchEntry[] {
  return nodes.flatMap((node) => [
    { category: node, path: [...parents, node.name].join(" / ") },
    ...flattenTree(node.children ?? [], [...parents, node.name]),
  ])
}

export function HeaderSearch({
  categories,
  onSelectCategory,
  className = "",
}: HeaderSearchProps) {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const entries = useMemo(() => flattenTree(categories), [categories])

  const results = useMemo(() => {
    const term = query.trim().toLocaleLowerCase()
    if (!term) return []
    return entries
      .filter((entry) => entry.category.name.toLocaleLowerCase().includes(term))
      .slice(0, MAX_RESULTS)
  }, [entries, query])

  // Close the results list when clicking anywhere outside the search box
  useEffect(() => {
    function handleMouseDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleMouseDown)
    return () => document.removeEventListener("mousedown", handleMouseDown)
  }, [])

  function selectEntry(entry: SearchEntry) {
    onSelectCategory(entry.category)
    setQuery("")
    setOpen(false)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setOpen(false)
    } else if (event.key === "ArrowDown") {
      event.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (event.key === "Enter" && results[activeIndex]) {
      selectEntry(results[activeIndex])
    }
  }

  const showList = open && query.trim().length > 0

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        dir="auto"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setActiveIndex(0)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Categories Search ..."
        aria-label="Search categories"
        className="h-8 pl-8"
      />

      {showList && (
        <ul
          role="listbox"
          className="fixed inset-x-2 top-16 z-50 mt-1.5 max-h-72 overflow-y-auto sm:absolute sm:inset-x-auto sm:top-full sm:w-full sm:min-w-64 rounded-lg bg-popover p-1 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10"
        >
          {results.length === 0 ? (
            <li className="px-2 py-1.5 text-muted-foreground" dir="rtl">
              لا توجد نتائج
            </li>
          ) : (
            results.map((entry, index) => (
              <li
                key={entry.category.id}
                role="option"
                aria-selected={index === activeIndex}
              >
                <button
                  type="button"
                  dir="auto"
                  onClick={() => selectEntry(entry)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`flex w-full flex-col items-start rounded-md px-2 py-1.5 text-start transition-colors ${
                    index === activeIndex ? "bg-accent" : ""
                  }`}
                >
                  <span className="font-medium">{entry.category.name}</span>
                  {entry.path !== entry.category.name && (
                    <span className="text-xs text-muted-foreground">
                      {entry.path}
                    </span>
                  )}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
