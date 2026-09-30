// أنواع البيانات - مطابقة تماماً لشكل استجابة Laravel API
// هذا يضمن أن التبديل لاحقاً من mockData إلى API حقيقي لن يحتاج أي تعديل في المكوّنات

export interface Category {
  id: number
  name: string
  parent_id: number | null
  user_id: number
  children?: Category[] // موجودة فقط عند جلب الشجرة الكاملة (nested)
  created_at?: string
  updated_at?: string
}

export type ContentType = "article" | "image" | "pdf"

export interface Content {
  id: number
  category_id: number
  user_id: number
  type: ContentType
  title: string
  body?: string | null // للمقالات (Markdown)
  file_path?: string | null // للصور و PDF
  created_at?: string
  updated_at?: string
}
