"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { getSupabaseBrowser } from "@/lib/supabase"
import type { Category } from "@/types"
import CategoryForm from "@/components/categories/category-form"
import { useToast } from "@/components/ui/use-toast"

export default function EditCategoryPage() {
  const [category, setCategory] = useState<Category | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const params = useParams()
  const { toast } = useToast()
  const supabase = getSupabaseBrowser()

  useEffect(() => {
    const fetchCategory = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await supabase.from("categories").select("*").eq("id", params.id).single()

        if (error) throw error
        setCategory(data)
      } catch (error: any) {
        console.error("Error fetching category:", error.message)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load category",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchCategory()
    }
  }, [params.id, supabase, toast])

  if (isLoading) {
    return <div>Loading category...</div>
  }

  if (!category) {
    return <div>Category not found</div>
  }

  return <CategoryForm initialData={category} onReload={() => {}} />
}

