import { Suspense } from "react"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import ProductCard from "@/components/products/product-card"
import { Separator } from "@/components/ui/separator"

interface ProductsPageProps {
  searchParams: {
    featured?: string
    category?: string
    sort?: string
  }
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { featured, category, sort } = searchParams
  console.log(searchParams)
  const supabase = createServerComponentClient({ cookies })

  let query = supabase.from("products").select("*").eq("is_active", true)

  // Apply filters
  if (featured === "true") {
    query = query.eq("is_featured", true)
  }

  if (category) {
    query = query.eq("category_id", category)
  }

  // Apply sorting
  if (sort === "price-asc") {
    query = query.order("price", { ascending: true })
  } else if (sort === "price-desc") {
    query = query.order("price", { ascending: false })
  } else {
    query = query.order("created_at", { ascending: false })
  }

  const { data: products, error } = await query

  if (error) {
    console.error("Error fetching products:", error)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-start gap-4 md:flex-row md:justify-between md:gap-8">
        <div className="flex-1 space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">
            {featured === "true" ? "Featured Products" : "All Products"}
          </h1>
          <p className="text-muted-foreground">Browse our collection of high-quality products</p>
        </div>
      </div>
      <Separator className="my-6" />

      <Suspense fallback={<div>Loading products...</div>}>
        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-xl font-medium text-muted-foreground">No products found</p>
          </div>
        )}
      </Suspense>
    </div>
  )
}

