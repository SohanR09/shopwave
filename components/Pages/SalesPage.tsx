"use client"

import ProductCard from "@/components/products/product-card"
import { Separator } from "@/components/ui/separator"
import { getSupabaseServer } from "@/lib/supabase"
import { Loader2 } from "lucide-react"
import { Suspense, useEffect, useState } from "react"

export default function SalePage() {
  const supabase = getSupabaseServer()

  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })

      if (error) {
        setError(true)
      }
      const salesProducts = data?.filter((product: any) => product.cost_price > product.price)
      setProducts(salesProducts as any[])
      setLoading(false)
    }
    fetchProducts()
  }, [])
  

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">Error fetching sale products</p>
      </div>
    )
  }

  if(loading){
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-10 h-10 animate-spin" />
        <span className="text-muted-foreground">Loading sale products...</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-start gap-4">
        <div className="flex-1 space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">Sale Items</h1>
          <p className="text-muted-foreground">Special discounts on selected products. Limited time offers!</p>
        </div>
      </div>
      <Separator className="my-6" />

      <Suspense fallback={<div>Loading sale items...</div>}>
        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-xl font-medium text-muted-foreground">No sale items available</p>
            <p className="text-sm text-muted-foreground mt-2">Check back later for new offers</p>
          </div>
        )}
      </Suspense>
    </div>
  )
}

