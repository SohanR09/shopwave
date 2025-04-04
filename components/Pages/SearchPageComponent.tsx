"use client"

import { Suspense, useEffect, useState } from "react"
import { notFound, useParams, usePathname } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import ProductCard from "@/components/products/product-card"
import { Separator } from "@/components/ui/separator"
import { getSupabaseServer } from "@/lib/supabase"
import { Router } from "next/router"
import { Loader2 } from "lucide-react"
interface SearchPageProps {
  q: string
}

export default function SearchPageComponent({ q }: SearchPageProps) {

  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const supabase = getSupabaseServer()

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .ilike("name", `%${q}%`)
        .eq("is_active", true)
        .order("created_at", { ascending: false })

      if (error) {
        setError(true)
        console.log("Error searching products:", error)
      }
      setProducts(data as any[])
      setLoading(false)
    }
    fetchProducts()
  }, [q])

  if(error){
    return <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">Error searching products</p>
    </div>
  }

  if(loading){
    return (<div className="flex justify-center items-center h-screen">
        <Loader2 className="w-10 h-10 animate-spin" />
    </div>)
  }
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-start gap-4">
        <div className="flex-1 space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">Search Results</h1>
          <p className="text-muted-foreground">
            {products && products.length > 0
              ? `Found ${products.length} results for "${q}"`
              : `No results found for "${q}"`}
          </p>
        </div>
      </div>
      <Separator className="my-6" />

      <Suspense fallback={<div>Loading search results...</div>}>
        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-xl font-medium text-muted-foreground">No products found</p>
            <p className="text-sm text-muted-foreground mt-2">Try searching with different keywords</p>
          </div>
        )}
      </Suspense>
    </div>
  )
}

