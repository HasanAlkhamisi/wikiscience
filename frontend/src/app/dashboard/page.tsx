"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CategoryTree } from "@/components/CategoryTree"
import { AppHeader } from "@/components/AppHeader"
import { logout } from "@/lib/auth"
import api from "@/lib/api"
import { Category } from "@/types"
import ContentFeed from "@/components/ContentFeed"
import TableOfContents from "@/components/TableOfContents"
import { ScienceIllustration } from "@/components/ScienceIllustration"
import { MobileSidebar } from "@/components/MobileSidebar"

const RECENT_KEY = "wikiscience:recent-categories"
const MAX_RECENT = 8

export default function DashboardPage() {
  const router = useRouter()

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  )
  const [refreshKey, setRefreshKey] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // آخر التصنيفات المزارة: نخزّن الـ ids فقط (الأحدث أولًا) في localStorage
  // ونحوّلها لكائنات من الشجرة الحالية، فلا نعرض تصنيفًا محذوفًا.
  const [recentIds, setRecentIds] = useState<number[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY)
      const parsed = raw ? JSON.parse(raw) : []
      if (Array.isArray(parsed)) setRecentIds(parsed.filter(Number.isInteger))
    } catch {
      // التخزين غير متاح - نتجاهل
    }
  }, [])

  function selectCategory(category: Category) {
    setSelectedCategory(category)
    const next = [
      category.id,
      ...recentIds.filter((id) => id !== category.id),
    ].slice(0, MAX_RECENT)
    setRecentIds(next)
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(next))
    } catch {
      // ignore
    }
  }

  async function fetchCategories() {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get("/categories")
      setCategories(response.data)
    } catch (err: any) {
      console.error("Error fetching categories:", err)
      setError(err.response?.data?.message || "حدث خطأ أثناء جلب البيانات")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  function handleLogout() {
    logout()
    router.push("/login")
  }

  // Recursive lookup: a favorite only gives us a category_id, but
  // CategoryTree/ContentFeed expect the full Category object.
  function findCategoryById(nodes: Category[], id: number): Category | null {
    for (const node of nodes) {
      if (node.id === id) return node
      if (node.children) {
        const found = findCategoryById(node.children, id)
        if (found) return found
      }
    }
    return null
  }

  function handleSelectFavorite(contentId: number, categoryId: number) {
    const category = findCategoryById(categories, categoryId)
    if (category) selectCategory(category)

    // Wait for the new ContentFeed to render before scrolling to the item
    setTimeout(() => {
      document
        .getElementById(`content-${contentId}`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 300)
  }

  const recentCategories = recentIds
    .map((id) => findCategoryById(categories, id))
    .filter((c): c is Category => c !== null)

  // اختيار تصنيف من الدرج على الجوال يغلق الدرج ليظهر المحتوى مباشرة
  function handleSelectFromDrawer(category: Category) {
    selectCategory(category)
    setMobileMenuOpen(false)
  }

  // نفس محتوى الشجرة يُستخدم في الشريط الجانبي (md+) وفي الدرج (الجوال)
  function renderSidebarBody(
    onSelect: (category: Category) => void,
    tocClassName = ""
  ) {
    return (
      <>
        {loading && (
          <p className="animate-pulse p-2 text-sm text-muted-foreground">
            جاري جلب التصنيفات...
          </p>
        )}

        {error && (
          <p className="p-2 text-sm font-medium text-destructive">❌ {error}</p>
        )}

        {!loading && !error && (
          <CategoryTree
            categories={categories}
            selectedCategoryId={selectedCategory?.id}
            onSelectCategory={onSelect}
            onDataChanged={fetchCategories}
          />
        )}

        {/* الفهرس هنا يظهر في الجوال/التابلت فقط؛ من xl يصبح في العمود الأيمن */}
        {selectedCategory && (
          <div className={tocClassName}>
            <TableOfContents
              categoryId={selectedCategory.id}
              refreshKey={refreshKey}
            />
          </div>
        )}
      </>
    )
  }

  return (
    // h-dvh بدل h-screen: على متصفحات الجوال يأخذ شريط العنوان المتحرك بالحسبان
    <div className="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
      <AppHeader
        categories={categories}
        selectedCategoryId={selectedCategory?.id}
        onSelectCategory={selectCategory}
        recentCategories={recentCategories}
        favoritesRefreshKey={refreshKey}
        onSelectFavorite={handleSelectFavorite}
        onLogout={handleLogout}
        onOpenMobileMenu={() => setMobileMenuOpen(true)}
      />

      <MobileSidebar
        open={mobileMenuOpen}
        onOpenChange={setMobileMenuOpen}
        title="Categories Tree"
      >
        {renderSidebarBody(handleSelectFromDrawer)}
      </MobileSidebar>

      <div className="mt-2 flex flex-1 overflow-hidden md:mx-10">
        {/* Desktop / tablet sidebar */}
        <aside className="hidden w-75 flex-col border-r-2 bg-background md:flex">
          <h2 className="m-2 text-center text-base font-semibold text-muted-foreground">
            Categories Tree
          </h2>
          {renderSidebarBody(selectCategory, "xl:hidden")}
        </aside>

        {/* Main content area - grows to fill the remaining width */}
        <section className="min-w-0 flex-1 overflow-y-auto p-3 sm:p-6">
          {selectedCategory ? (
            <ContentFeed
              categoryId={Number(selectedCategory.id)}
              onDataChanged={() => setRefreshKey((k) => k + 1)}
            />
          ) : (
            <p className="p-8 text-center text-muted-foreground">
              اختر تصنيفًا من الشجرة للبدء
            </p>
          )}
        </section>

        {/* Right column (xl+): illustration on top, table of contents below */}
        <aside className="hidden w-72 shrink-0 flex-col border-l-2 bg-background xl:flex">
          <ScienceIllustration title={selectedCategory?.name ?? "Wiki-Science"} />
          {selectedCategory && (
            <TableOfContents
              variant="panel"
              categoryId={selectedCategory.id}
              refreshKey={refreshKey}
            />
          )}
        </aside>
      </div>
    </div>
  )
}
