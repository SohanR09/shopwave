import { Suspense } from "react"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import ProductCard from "@/components/products/product-card"
import { Separator } from "@/components/ui/separator"

export default async function SalePage() {
  const supabase = createServerComponentClient({ cookies })

  // Fetch products on sale (with original_price not null)
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_archived", false)
    .not("original_price", "is", null)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching sale products:", error)
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

