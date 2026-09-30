"use client"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { Content, ContentType } from "@/types"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRef } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import ConfirmDialog from "@/components/ConfirmDialog"
import { ArrowUpIcon, ImagePlusIcon, Heart } from "lucide-react"

interface Props {
  categoryId: number
  onDataChanged: () => void
}

export default function ContentFeed({ categoryId, onDataChanged }: Props) {
  const [contents, setContents] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Content | null>(null)
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null)

  // معرّفات المحتوى المفضّل لدى المستخدم - تُجلب مرة واحدة فقط
  // (مستقلة عن categoryId لأن المفضلة تشمل كل التصنيفات)، وتُحدَّث
  // محليًا فورًا عند الضغط على النجمة بدل انتظار إعادة الجلب الكاملة.
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set())

  useEffect(() => {
    async function loadFavoriteIds() {
      try {
        const { data } = await api.get<Content[]>("/favorites")
        setFavoriteIds(new Set(data.map((c) => c.id)))
      } catch (err) {
        console.error("Failed to load favorites:", err)
      }
    }
    loadFavoriteIds()
  }, [])

  async function toggleFavorite(id: number, isFavorite: boolean) {
    // تحديث تفاؤلي (optimistic): نغيّر الشكل فورًا بدل انتظار رد السيرفر،
    // مع تراجع تلقائي لو فشل الطلب - يعطي إحساس استجابة فورية بالزر.
    setFavoriteIds((prev) => {
      const next = new Set(prev)
      isFavorite ? next.delete(id) : next.add(id)
      return next
    })

    try {
      if (isFavorite) {
        await api.delete(`/favorites/${id}`)
      } else {
        await api.post(`/favorites/${id}`)
      }
      onDataChanged() // يبلّغ قسم "المفضلة" الجانبي بضرورة إعادة الجلب
    } catch (err) {
      // تراجع عن التحديث التفاؤلي عند الفشل
      setFavoriteIds((prev) => {
        const next = new Set(prev)
        isFavorite ? next.add(id) : next.delete(id)
        return next
      })
      toast.error("فشل تحديث المفضلة")
    }
  }

  async function load() {
    setLoading(true)
    try {
      const { data } = await api.get<Content[]>("/contents", {
        params: { category_id: categoryId },
      })
      setContents(data)
    } catch (err) {
      console.error("Failed to load contents:", err)
      toast.error("فشل تحميل المحتوى")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [categoryId])

  function handleDeleteClick(id: number) {
    setDeleteTargetId(id)
  }

  async function confirmDelete() {
    if (!deleteTargetId) return

    try {
      await api.delete(`/contents/${deleteTargetId}`)

      await load()
      onDataChanged()
      toast.success("تم حذف المحتوى بنجاح")
    } catch (err) {
      toast.error("فشل الحذف")
    } finally {
      setDeleteTargetId(null)
    }
  }

  function openAddForm() {
    setEditingItem(null)
    setFormOpen(true)
  }
  const divRef = useRef<HTMLDivElement>(null)
  function toTop() {
    divRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })
  }

  function openEditForm(item: Content) {
    setEditingItem(item)
    setFormOpen(true)
  }

  async function handleCreate(payload: {
    type: ContentType
    title: string
    body: string | null
    file: File | null
  }) {
    try {
      const formData = new FormData()
      formData.append("category_id", String(categoryId))
      formData.append("type", payload.type)
      formData.append("title", payload.title)
      if (payload.body) formData.append("body", payload.body)
      if (payload.file) formData.append("file", payload.file)

      await api.post("/contents", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      setFormOpen(false)
      await load()
      onDataChanged()
      toast.success("تمت إضافة المحتوى بنجاح")
    } catch (err) {
      toast.error("فشل الحفظ")
    }
  }

  async function handleUpdate(
    id: number,
    payload: { title: string; body: string | null; file: File | null }
  ) {
    try {
      const formData = new FormData()
      formData.append("title", payload.title)
      if (payload.body) formData.append("body", payload.body)
      if (payload.file) formData.append("file", payload.file)
      formData.append("_method", "PUT")

      await api.post(`/contents/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      setFormOpen(false)
      setEditingItem(null)
      await load()
      onDataChanged()
      toast.success("تم تعديل المحتوى بنجاح")
    } catch (err) {
      toast.error("فشل التعديل")
    }
  }

  if (loading)
    return (
      <div className="p-8 text-center text-muted-foreground">
        جاري التحميل...
      </div>
    )

  return (
    <div ref={divRef} className="mx-auto w-full max-w-3xl p-0 sm:p-2">
      <div className="mx-2 mb-2 flex justify-end gap-2">
        <Button onClick={openAddForm}>+ Add Content</Button>
      </div>
      {contents.length === 0 ? (
        <p className="text-center text-muted-foreground">
          لا يوجد محتوى في هذا التصنيف بعد
        </p>
      ) : (
        <div className="space-y-2">
          {contents.map((item) => (
            <ContentBlock
              key={item.id}
              item={item}
              isFavorite={favoriteIds.has(item.id)}
              onToggleFavorite={toggleFavorite}
              onEdit={openEditForm}
              onDelete={handleDeleteClick}
            />
          ))}
          <div>
            <button className="outline" aria-label="Submit" onClick={toTop}>
              <ArrowUpIcon />
            </button>
          </div>
        </div>
      )}

      <ContentFormDialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditingItem(null)
        }}
        editingItem={editingItem}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
      />

      <ConfirmDialog
        open={!!deleteTargetId}
        title="تأكيد الحذف"
        description="هل تريد حذف هذا المحتوى؟ لا يمكن التراجع عن هذا الإجراء."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  )
}

function ContentBlock({
  item,
  isFavorite,
  onToggleFavorite,
  onEdit,
  onDelete,
}: {
  item: Content
  isFavorite: boolean
  onToggleFavorite: (id: number, isFavorite: boolean) => void
  onEdit: (item: Content) => void
  onDelete: (id: number) => void
}) {
  const fileUrl = item.file_path
    ? `${process.env.NEXT_PUBLIC_STORAGE_URL}/${item.file_path}`
    : null

  return (
    <div
      id={`content-${item.id}`}
      className="group relative rounded-lg bg-background p-4 pt-14 sm:p-6"
    >
      <div className="absolute right-3 top-3 flex gap-2 bg-background sm:right-4 sm:top-4">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onToggleFavorite(item.id, isFavorite)}
          title={
            isFavorite ? "Remove From Favorites list" : "Add to Favorites list"
          }
        >
          <Heart
            className={isFavorite ? "fill-yellow-400 text-yellow-400" : ""}
          />
        </Button>
        <div className="flex gap-2 transition [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-focus-within:opacity-100 [@media(hover:hover)]:group-hover:opacity-100">
          <Button size="sm" variant="outline" onClick={() => onEdit(item)}>
            ✏️
          </Button>
          <Button size="sm" variant="outline" onClick={() => onDelete(item.id)}>
            🗑️
          </Button>
        </div>
      </div>

      {item.type === "article" && (
        <article className="prose prose-stone max-w-none dark:prose-invert">
          <h2 className="mb-3 font-serif text-xl font-bold text-primary">
            {item.title}
          </h2>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              img: ({ src, alt }) =>
                typeof src === "string" ? (
                  <img
                    src={src}
                    alt={alt ?? ""}
                    loading="lazy"
                    className="max-h-96 max-w-full rounded border border-border object-contain"
                  />
                ) : null,
            }}
          >
            {item.body || ""}
          </ReactMarkdown>
        </article>
      )}

      {item.type === "image" && (
        <div>
          <h2 className="mb-3 font-serif text-xl font-bold text-primary">
            {item.title}
          </h2>
          {fileUrl ? (
            <img
              src={fileUrl}
              alt={item.title}
              className="max-h-96 max-w-full rounded border border-border object-contain"
            />
          ) : (
            <div className="flex h-48 items-center justify-center rounded border border-dashed border-border text-muted-foreground">
              لا توجد صورة
            </div>
          )}
        </div>
      )}

      {item.type === "pdf" && (
        <div>
          <h2 className="mb-3 font-serif text-xl font-bold text-primary">
            {item.title}
          </h2>
          {fileUrl ? (
            <a
              href={fileUrl}
              target="_blank"
              className="text-primary underline"
            >
              فتح PDF
            </a>
          ) : (
            <div className="text-muted-foreground">لا يوجد ملف</div>
          )}
        </div>
      )}
    </div>
  )
}

function ContentFormDialog({
  open,
  onClose,
  editingItem,
  onCreate,
  onUpdate,
}: {
  open: boolean
  onClose: () => void
  editingItem: Content | null
  onCreate: (payload: {
    type: ContentType
    title: string
    body: string | null
    file: File | null
  }) => void
  onUpdate: (
    id: number,
    payload: { title: string; body: string | null; file: File | null }
  ) => void
}) {
  const isEditMode = editingItem !== null

  const [type, setType] = useState<ContentType>("article")
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const bodyRef = useRef<HTMLTextAreaElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  // رفع صورة إلى الخادم ثم إدراج رابطها في مكان المؤشر بصيغة Markdown
  async function handleInsertImage(e: React.ChangeEvent<HTMLInputElement>) {
    const image = e.target.files?.[0]
    e.target.value = "" // يسمح باختيار الصورة نفسها مرة أخرى
    if (!image) return

    if (!image.type.startsWith("image/")) {
      setError("الملف المختار ليس صورة")
      return
    }
    if (image.size > 5 * 1024 * 1024) {
      setError("حجم الصورة يجب ألا يتجاوز 5MB")
      return
    }

    setError(null)
    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append("file", image)
      const { data } = await api.post("/sync/upload-file", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      const url: string | undefined =
        data.url ??
        (data.path
          ? `${process.env.NEXT_PUBLIC_STORAGE_URL}/${data.path}`
          : undefined)
      if (!url) throw new Error("no url in response")

      const alt = image.name.replace(/\.[^.]+$/, "")
      const snippet = `\n![${alt}](${url})\n`
      const el = bodyRef.current
      const start = el?.selectionStart ?? body.length
      const end = el?.selectionEnd ?? body.length
      setBody(body.slice(0, start) + snippet + body.slice(end))
      requestAnimationFrame(() => el?.focus())
    } catch (err: any) {
      const status = err?.response?.status
      const serverMsg =
        err?.response?.data?.errors?.file?.[0] ?? err?.response?.data?.message
      setError(
        `فشل رفع الصورة${status ? ` (HTTP ${status})` : " (لا يوجد رد من الخادم)"}` +
          (status === 404
            ? " - المسار POST /sync/upload-file غير معرّف في Laravel"
            : "") +
          (serverMsg ? `: ${serverMsg}` : "")
      )
    } finally {
      setUploadingImage(false)
    }
  }

  useEffect(() => {
    if (editingItem) {
      setType(editingItem.type)
      setTitle(editingItem.title)
      setBody(editingItem.body || "")
    } else {
      setType("article")
      setTitle("")
      setBody("")
    }
    setFile(null)
    setError(null)
  }, [editingItem, open])

  function handleSubmit() {
    if (!title.trim()) {
      setError("العنوان مطلوب")
      return
    }
    if (type === "article" && !body.trim()) {
      setError("النص مطلوب للمقالة")
      return
    }
    if (!isEditMode && (type === "image" || type === "pdf") && !file) {
      setError("الملف مطلوب")
      return
    }

    if (isEditMode && editingItem) {
      onUpdate(editingItem.id, {
        title: title.trim(),
        body: type === "article" ? body.trim() : null,
        file,
      })
    } else {
      onCreate({
        type,
        title: title.trim(),
        body: type === "article" ? body.trim() : null,
        file,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "تعديل المحتوى" : "إضافة محتوى جديد"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as ContentType)}
            disabled={isEditMode}
            className="w-full rounded border border-border bg-background p-2 disabled:opacity-60"
          >
            <option value="article">مقالة</option>
            <option value="image">صورة</option>
            <option value="pdf">PDF</option>
          </select>

          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="العنوان"
          />

          {type === "article" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploadingImage}
                  onClick={() => imageInputRef.current?.click()}
                >
                  <ImagePlusIcon />
                  {uploadingImage ? "جاري الرفع..." : "إدراج صورة"}
                </Button>
                <span className="text-xs text-muted-foreground">
                  أو الصق رابط صورة: ![وصف](https://...)
                </span>
              </div>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleInsertImage}
              />
              <textarea
                ref={bodyRef}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="النص (يدعم Markdown)"
                className="h-40 w-full rounded border border-border bg-background p-2"
              />
            </div>
          )}

          {(type === "image" || type === "pdf") && (
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button onClick={handleSubmit}>حفظ</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
