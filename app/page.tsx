import Link from "next/link"
import Image from "next/image"
import { getSupabaseServer } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import ProductCard from "@/components/products/product-card"
import { ArrowRight } from "lucide-react"

export default async function HomePage() {
  const supabase = getSupabaseServer()

  // Fetch featured products
  const { data: featuredProducts } = await supabase
    .from("products")
    .select("*")
    .eq("is_featured", true)
    .eq("is_archived", false)
    .order("created_at", { ascending: false })
    .limit(8)

  // Fetch categories for category cards
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .is("parent_id", null)
    .order("name")
    .limit(6)

  // Fetch sale products
  const { data: saleProducts } = await supabase
    .from("products")
    .select("*")
    .eq("is_archived", false)
    .not("original_price", "is", null)
    .order("created_at", { ascending: false })
    .limit(4)

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-glacier-900 to-glacier-700 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">Discover Quality Products for Every Need</h1>
              <p className="text-lg md:text-xl opacity-90">
                Shop the latest trends with confidence. Free shipping on orders over $50.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" asChild className="bg-white text-glacier-800 hover:bg-gray-100">
                  <Link href="/products">Shop Now</Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="border-white text-white hover:bg-white/10">
                  <Link href="/categories">Browse Categories</Link>
                </Button>
              </div>
            </div>
            <div className="hidden md:block relative h-[400px]">
              <Image
                src="/placeholder.svg?height=400&width=600"
                alt="Featured Products"
                fill
                className="object-cover rounded-lg"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Featured Products</h2>
            <Link href="/products?featured=true" className="text-glacier-600 hover:text-glacier-700 flex items-center">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredProducts?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
            {!featuredProducts?.length && (
              <p className="col-span-full text-center py-8 text-muted-foreground">
                No featured products available at the moment.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Category Cards */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">Shop by Category</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories?.map((category) => (
              <Link key={category.id} href={`/category/${category.slug}`}>
                <Card className="overflow-hidden h-full transition-all hover:shadow-md">
                  <div className="aspect-video relative">
                    {category.image_url ? (
                      <Image
                        src={category.image_url || "/placeholder.svg"}
                        alt={category.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-glacier-100 flex items-center justify-center">
                        <span className="text-glacier-600 font-medium">{category.name}</span>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="text-xl font-semibold">{category.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {category.description || `Browse our collection of ${category.name}`}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Sales/Ad Section */}
      <section className="py-12 bg-gradient-to-r from-red-500 to-orange-500 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="inline-block px-3 py-1 bg-white text-red-600 font-semibold rounded-full text-sm">
                Limited Time Offer
              </span>
              <h2 className="text-3xl md:text-4xl font-bold">Summer Sale Up to 50% Off</h2>
              <p className="text-lg opacity-90">Grab amazing deals on seasonal items before they're gone!</p>
              <Button size="lg" asChild className="bg-white text-red-600 hover:bg-gray-100">
                <Link href="/sale">Shop the Sale</Link>
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {saleProducts?.slice(0, 4).map((product) => (
                <Link key={product.id} href={`/product/${product.id}`} className="block">
                  <div className="bg-white/10 p-2 rounded-lg hover:bg-white/20 transition-colors">
                    <div className="aspect-square relative rounded overflow-hidden mb-2">
                      {product.images && product.images[0] ? (
                        <Image
                          src={product.images[0] || "/placeholder.svg"}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-white/20 flex items-center justify-center">
                          <span className="text-white/70">No image</span>
                        </div>
                      )}
                    </div>
                    <h3 className="font-medium text-sm line-clamp-1">{product.name}</h3>
                    <div className="flex items-center mt-1">
                      <span className="font-bold">${product.price.toFixed(2)}</span>
                      {product.original_price && (
                        <span className="ml-2 text-xs line-through opacity-70">
                          ${product.original_price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
            <p className="text-muted-foreground mb-6">
              Stay updated with the latest products, exclusive offers, and shopping tips.
            </p>
            <form className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              />
              <Button type="submit" className="bg-glacier-600 hover:bg-glacier-700">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}

