"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { getSupabaseBrowser } from "@/lib/supabase"
import type { Product } from "@/types"
import ProductForm from "@/components/products/product-form"
import { useToast } from "@/components/ui/use-toast"

export default function EditProductPage() {
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const params = useParams()
  const { toast } = useToast()
  const supabase = getSupabaseBrowser()

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*, images:product_images(*)")
          .eq("id", params.id)
          .single()

        if (error) throw error
        setProduct(data)
      } catch (error: any) {
        console.error("Error fetching product:", error.message)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load product",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchProduct()
    }
  }, [params.id, supabase, toast])

  if (isLoading) {
    return <div>Loading product...</div>
  }

  if (!product) {
    return <div>Product not found</div>
  }

  return <ProductForm initialData={product} onReload={() => {}} />
}

