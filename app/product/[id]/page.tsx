import { notFound } from "next/navigation"
import Image from "next/image"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { formatPrice } from "@/lib/utils"
import { ShoppingCart, Heart } from "lucide-react"

interface ProductPageProps {
  params: {
    id: string
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = params
  const supabase = createServerComponentClient({ cookies })

  // Fetch product details
  const { data: product, error } = await supabase.from("products").select("*, categories(name)").eq("id", id).single()

  if (error || !product) {
    notFound()
  }

  // Fetch related products
  const { data: relatedProducts } = await supabase
    .from("products")
    .select("*")
    .eq("category_id", product.category_id)
    .neq("id", id)
    .eq("is_archived", false)
    .limit(4)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
          {product.images && product.images[0] ? (
            <Image
              src={product.images[0] || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gray-100">
              <span className="text-muted-foreground">No image available</span>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex flex-col space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Category: {product.categories?.name || "Uncategorized"}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-2xl font-bold">{formatPrice(product.price)}</span>
            {product.original_price && (
              <span className="text-lg text-muted-foreground line-through">{formatPrice(product.original_price)}</span>
            )}
          </div>

          <p className="text-muted-foreground">{product.description}</p>

          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            <Button size="lg" className="bg-glacier-600 hover:bg-glacier-700">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
            <Button size="lg" variant="outline">
              <Heart className="mr-2 h-4 w-4" />
              Add to Wishlist
            </Button>
          </div>

          {/* Product Details */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Product Details</h2>
            <Separator className="my-4" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">SKU</h3>
                <p>{product.sku || "N/A"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Availability</h3>
                <p>{product.inventory > 0 ? "In Stock" : "Out of Stock"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">Related Products</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {relatedProducts?.map((relatedProduct) => (
            <div key={relatedProduct.id} className="group">
              <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                {relatedProduct.images && relatedProduct.images[0] ? (
                  <Image
                    src={relatedProduct.images[0] || "/placeholder.svg"}
                    alt={relatedProduct.name}
                    width={300}
                    height={300}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gray-100">
                    <span className="text-muted-foreground">No image</span>
                  </div>
                )}
              </div>
              <h3 className="mt-4 text-sm font-medium">{relatedProduct.name}</h3>
              <p className="mt-1 text-sm font-medium">{formatPrice(relatedProduct.price)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

