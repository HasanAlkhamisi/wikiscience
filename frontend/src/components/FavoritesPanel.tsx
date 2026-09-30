"use client"

import { useEffect, useState } from "react"
import { StarIcon } from "lucide-react"
import { Content } from "@/types"
import api from "@/lib/api"

interface Props {
  refreshKey: number
  onSelectContent: (contentId: number, categoryId: number) => void
}

export default function FavoritesPanel({ refreshKey, onSelectContent }: Props) {
  const [favorites, setFavorites] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const { data } = await api.get<Content[]>("/favorites")
        setFavorites(data)
      } catch (err) {
        console.error("Failed to load favorites:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
    // refreshKey يزيد من ContentFeed عند أي تبديل مفضلة (وأيضًا عند أي
    // إضافة/تعديل/حذف محتوى) - نعيد الجلب لضمان القائمة محدّثة دائمًا.
  }, [refreshKey])

  if (loading)
    return <p className="text-xs text-muted-foreground">جاري التحميل...</p>

  if (favorites.length === 0)
    return (
      <p className="text-xs text-muted-foreground">
        لم تضِف أي محتوى للمفضلة بعد
      </p>
    )

  return (
    <div className="flex flex-col gap-1">
      {favorites.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelectContent(item.id, item.category_id)}
          className="flex items-center gap-2 rounded-md p-2 text-right text-sm transition hover:bg-accent"
        >
          <StarIcon className="size-4 shrink-0 fill-yellow-400 text-yellow-400" />
          <span className="truncate">{item.title}</span>
        </button>
      ))}
    </div>
  )
}
