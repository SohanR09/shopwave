import { notFound } from "next/navigation"
import { getSupabaseServer } from "@/lib/supabase-client"
import ProductCard from "@/components/products/product-card"
import { Separator } from "@/components/ui/separator"

interface CategoryPageProps {
  params: {
    slug: string
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = params
  const supabase = getSupabaseServer()

  // Fetch the category
  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single()

  if (categoryError || !category) {
    notFound()
  }

  // Fetch products in this category
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("*")
    .eq("category_id", category.id)
    .eq("is_archived", false)
    .order("created_at", { ascending: false })

  if (productsError) {
    console.error("Error fetching products:", productsError)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-start gap-4 md:flex-row md:justify-between md:gap-8">
        <div className="flex-1 space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">{category.name}</h1>
          <p className="text-muted-foreground">{category.description || `Browse our collection of ${category.name}`}</p>
        </div>
      </div>
      <Separator className="my-6" />

      {products && products.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
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

