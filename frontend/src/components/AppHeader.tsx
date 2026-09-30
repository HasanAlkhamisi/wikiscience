"use client"

import Link from "next/link"
import { FlaskConicalIcon, LogOutIcon, MenuIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RecentMainCategories } from "@/components/RecentMainCategories"
import { FavoritesDropdown } from "@/components/FavoritesDropdown"
import { RecentlyVisitedDropdown } from "@/components/RecentlyVisitedDropdown"
import { HeaderSearch } from "@/components/HeaderSearch"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Category } from "@/types"

interface AppHeaderProps {
  categories: Category[]
  selectedCategoryId?: number | null
  onSelectCategory: (category: Category) => void
  favoritesRefreshKey: number
  onSelectFavorite: (contentId: number, categoryId: number) => void
  onLogout: () => void
  // آخر التصنيفات التي زارها المستخدم (الأحدث أولًا)
  recentCategories: Category[]
  // يفتح الشجرة الجانبية على الشاشات الصغيرة
  onOpenMobileMenu?: () => void
}

export function AppHeader({
  categories,
  selectedCategoryId,
  onSelectCategory,
  favoritesRefreshKey,
  onSelectFavorite,
  onLogout,
  recentCategories,
  onOpenMobileMenu,
}: AppHeaderProps) {
  return (
    // dir="ltr" pins the zones physically (logo left, actions right)
    // no matter what direction the page itself uses
    <header
      dir="ltr"
      className="sticky top-0 z-50 h-16 shrink-0 border-b bg-background"
    >
      <div className="flex h-full items-center gap-2 px-3 sm:gap-5 md:px-6">
        {/* Mobile only: opens the categories drawer */}
        <Button
          variant="outline"
          size="icon"
          className="shrink-0 md:hidden"
          onClick={onOpenMobileMenu}
          aria-label="فتح التصنيفات"
        >
          <MenuIcon />
        </Button>

        {/* Logo */}
        <Link
          href="/dashboard"
          className="flex shrink-0 items-center gap-2 font-serif text-2xl font-bold tracking-tight m-4"
        >
          <FlaskConicalIcon className="size-5 text-primary" />
          <span className="hidden sm:inline">WikiScience</span>
        </Link>

        {/* Center zone: main categories + search, centered together */}
        <div className="flex h-full min-w-0 flex-1 items-center justify-center gap-2 sm:gap-5">
          <div className="hidden h-full min-w-0 lg:flex">
            <RecentMainCategories
              categories={categories}
              selectedCategoryId={selectedCategoryId}
              onSelectCategory={onSelectCategory}
            />
          </div>

          <HeaderSearch
            categories={categories}
            onSelectCategory={onSelectCategory}
            className="min-w-0 flex-1 sm:max-w-md"
          />
        </div>

        {/* Right zone: recent + favorites + theme switch + logout */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <RecentlyVisitedDropdown
            categories={recentCategories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={onSelectCategory}
          />
          <FavoritesDropdown
            refreshKey={favoritesRefreshKey}
            onSelectContent={onSelectFavorite}
          />
          <ThemeToggle />
          <Button
            variant="destructive"
            size="sm"
            onClick={onLogout}
            aria-label="log out"
            className="gap-1.5"
          >
            <LogOutIcon className="size-4" />
            <span className="hidden sm:inline">log out</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
