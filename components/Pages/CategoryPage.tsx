"use client"

import { notFound, useParams, useRouter } from "next/navigation"
import ProductCard from "@/components/products/product-card"
import { Separator } from "@/components/ui/separator"
import { useEffect, useState } from "react"
import { getSupabaseServer } from "@/lib/supabase"
import { Loader2 } from "lucide-react"

interface CategoryPageProps {
  slug: string
}

export default function CategoryPage({ slug }: CategoryPageProps) {
  const [category, setCategory] = useState<any | null>(null)
  const [products, seProduct] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  
  // const {slug} = useParams()


  useEffect(() => {
    const fetchCategory = async () => {
        setLoading(true)
        const supabase = getSupabaseServer()
        const { data, error: categoryError } = await supabase
            .from("categories")
            .select("*")
            .eq("slug", slug)
            .single()

      if (categoryError || !data) {
        notFound()
      }

      setCategory(data)
    } 
    fetchCategory()
  }, [slug])

  useEffect(() => {
    const fetchProducts = async () => {
        const supabase =  getSupabaseServer()
         // Fetch products in this category
        const { data, error: productsError } = await supabase
            .from("products")
            .select("*")
            .eq("category_id", category?.id)
            .eq("is_active", true)
            .order("created_at", { ascending: false })

        if (productsError) {
            console.error("Error fetching products:", productsError)
         }

         seProduct(data)
         setLoading(false)
    }
    category && fetchProducts()
  }, [category])

  if(loading){
    return <div className="flex justify-center items-center h-screen">
      <Loader2 className="w-10 h-10 animate-spin" />
    </div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-start gap-4 md:flex-row md:justify-between md:gap-8">
        <div className="flex-1 space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">{category?.name}</h1>
          <p className="text-muted-foreground">{category?.description || `Browse our collection of ${category?.name}`}</p>
        </div>
      </div>
      <Separator className="my-6" />

      {products && products.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-xl font-medium text-muted-foreground">No products found in this category</p>
        </div>
      )}
    </div>
  )
}

