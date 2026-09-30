"use client"

import { useState } from "react"
import { toast } from "sonner"
import {
  ChevronRightIcon,
  FolderIcon,
  TagIcon,
  PlusIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import ConfirmDialog from "@/components/ConfirmDialog"
import api from "@/lib/api"
import { Category } from "@/types"

interface CategoryTreeProps {
  categories: Category[]
  selectedCategoryId?: number | null
  onSelectCategory?: (category: Category) => void
  // تُستدعى بعد أي إضافة/تعديل/حذف ناجح، لأن CategoryTree لا يملك
  // بيانات الشجرة (تُمرَّر له من dashboard) - فهو يطلب من الأب إعادة الجلب
  // بدل ما يخزّن نسخته الخاصة ويخاطر بتعارضها مع حالة الأب.
  onDataChanged: () => void
}

// حد أقصى 3 مستويات (أساسي/فرعي/حفيد) مطابق للتحقق من جهة الـ backend.
const MAX_DEPTH = 2 // depth بالفهرسة من صفر: 0=أساسي، 1=فرعي، 2=حفيد

export function CategoryTree({
  categories,
  selectedCategoryId,
  onSelectCategory,
  onDataChanged,
}: CategoryTreeProps) {
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [parentForNew, setParentForNew] = useState<number | null>(null)

  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)

  const [name, setName] = useState("")
  const [error, setError] = useState<string | null>(null)

  function openAddModal(parentId: number | null) {
    setParentForNew(parentId)
    setName("")
    setError(null)
    setAddModalOpen(true)
  }

  async function handleCreate() {
    if (!name.trim()) {
      setError("الاسم مطلوب")
      return
    }
    try {
      await api.post("/categories", {
        name: name.trim(),
        parent_id: parentForNew,
      })
      setAddModalOpen(false)
      onDataChanged()
      toast.success("تمت إضافة التصنيف بنجاح")
    } catch (err: any) {
      const message = err.response?.data?.message || "حدث خطأ أثناء الإنشاء"
      setError(message)
      toast.error(message)
    }
  }

  function openEditModal(category: Category) {
    setEditingCategory(category)
    setName(category.name)
    setError(null)
    setEditModalOpen(true)
  }

  async function handleUpdate() {
    if (!name.trim() || !editingCategory) {
      setError("الاسم مطلوب")
      return
    }
    try {
      await api.put(`/categories/${editingCategory.id}`, { name: name.trim() })
      setEditModalOpen(false)
      onDataChanged()
      toast.success("تم تحديث التصنيف بنجاح")
    } catch (err: any) {
      const message = err.response?.data?.message || "حدث خطأ أثناء التعديل"
      setError(message)
      toast.error(message)
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    try {
      await api.delete(`/categories/${deleteTarget.id}`)
      onDataChanged()
      toast.success("تم حذف التصنيف بنجاح")
    } catch (err: any) {
      const message = err.response?.data?.message || "لا يمكن حذف هذا التصنيف"
      toast.error(message)
    } finally {
      setDeleteTarget(null)
    }
  }

  // أزرار العمليات الثلاث - تظهر عند تمرير الماوس فوق الصف (group-hover)
  function RowActions({
    category,
    depth,
  }: {
    category: Category
    depth: number
  }) {
    return (
      <div
        className="flex shrink-0 gap-0.5 transition [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-focus-within:opacity-100 [@media(hover:hover)]:group-hover:opacity-100"
        // يمنع أي ضغطة هنا من إطلاق onClick الخاص بزر الصف نفسه (التحديد/الطي)
        onClick={(e) => e.stopPropagation()}
      >
        {depth < MAX_DEPTH && (
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => openAddModal(category.id)}
            title="إضافة تصنيف فرعي"
          >
            <PlusIcon />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => openEditModal(category)}
          title="تعديل"
        >
          <PencilIcon />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => setDeleteTarget(category)}
          title="حذف"
        >
          <Trash2Icon />
        </Button>
      </div>
    )
  }

  // دالة تكرارية لرسم عناصر الشجرة والأبناء
  const renderCategoryItem = (category: Category, depth: number = 0) => {
    const hasChildren = Boolean(
      category.children && category.children.length > 0
    )
    const isSelected = selectedCategoryId === category.id

    // 1. إذا كان تصنيفاً يملك أبناء (يُعرض كـ Collapsible)
    if (hasChildren) {
      return (
        <Collapsible key={category.id} className="w-full">
          <div className="group flex items-center">
            <CollapsibleTrigger
              render={
                <Button
                  variant={isSelected ? "secondary" : "ghost"}
                  size="sm"
                  className={`flex-1 justify-start gap-2 whitespace-normal transition-none hover:bg-accent hover:text-accent-foreground ${
                    isSelected
                      ? "bg-accent font-medium text-accent-foreground"
                      : ""
                  }`}
                  onClick={() => onSelectCategory?.(category)}
                >
                  <ChevronRightIcon className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-90 rtl:rotate-180 rtl:group-data-[state=open]:rotate-90" />
                  <FolderIcon className="h-4 w-4 shrink-0 text-amber-500 fill-amber-500/20" />
                  <span className="text-start wrap-break-word p-2">
                    {category.name}
                  </span>
                </Button>
              }
            />
            <RowActions category={category} depth={depth} />
          </div>
          <CollapsibleContent className="mt-1 ms-4 border-s border-border ps-2">
            <div className="flex flex-col gap-1">
              {category.children?.map((child) =>
                renderCategoryItem(child, depth + 1)
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )
    }

    // 2. إذا كان تصنيفاً نهائياً (بدون أبناء)
    return (
      <div key={category.id} className="group flex items-center">
        <Button
          variant={isSelected ? "secondary" : "ghost"}
          size="sm"
          className={`flex-1 justify-start gap-2 whitespace-normal text-foreground hover:bg-accent ${
            isSelected ? "bg-accent font-medium text-primary" : ""
          }`}
          onClick={() => onSelectCategory?.(category)}
        >
          <TagIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="text-start wrap-break-word">{category.name}</span>
        </Button>
        <RowActions category={category} depth={depth} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1 w-full">
      <Button
        onClick={() => openAddModal(null)}
        size="sm"
        className="w-auto justify-start gap-1.5 m-2"
      >
        <PlusIcon className="size-2" />
        New Main category
      </Button>

      {categories && categories.length > 0 ? (
        categories.map((category) => renderCategoryItem(category))
      ) : (
        <p className="text-xs text-muted-foreground p-2">لا توجد تصنيفات</p>
      )}

      {/* Add Dialog */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {parentForNew ? "إضافة تصنيف فرعي" : "تصنيف رئيسي جديد"}
            </DialogTitle>
          </DialogHeader>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            placeholder="اسم التصنيف"
            autoFocus
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddModalOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleCreate}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل اسم التصنيف</DialogTitle>
          </DialogHeader>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
            placeholder="اسم التصنيف"
            autoFocus
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleUpdate}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="تأكيد الحذف"
        description={`هل تريد حذف "${deleteTarget?.name}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
