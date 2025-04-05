"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { getSupabaseServer } from "@/lib/supabase"
import { formatPrice } from "@/lib/utils"
import { Category, Product } from "@/types"
import { Heart, Loader2, ShoppingCart } from "lucide-react"
import Image from "next/image"
import { notFound } from "next/navigation"
import { useEffect, useState } from "react"
import ProductCard from "../products/product-card"

interface ProductPageProps {
  productId: string
}

export default function ProductDetailsPage({ productId }: ProductPageProps) {
  const supabase = getSupabaseServer()
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [product, setProduct] = useState<Product | null>({
    id: "",
    name: "",
    slug: "",
    description: "",
    price: 0,
    cost_price: 0,
    inventory_quantity: 0,
    category_id: "",
    category: {
        id: "",
        name: "",
        slug: "",
        description: "",
        image_url: "",
        parent_id: "",
        created_at: "",
        updated_at: "",
    },
    images: [],
    variants: [],
    created_at: "",
    updated_at: "", 
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  

  useEffect(() => {    
    const fetchData = async () => {
        setLoading(true)
     try{
        const { data, error } = await supabase.from("products").select("*").eq("id", productId).single()
        if (error) {
          setError(error.message)
        }
        const { data: categoryData, error: categoryError } = await supabase.from("categories").select("*").eq("id", data?.category_id).single()
        if (categoryError) {
            setError(categoryError.message)
        }
        const category = categoryData as Category
       
        setProduct({...data, category})
        setLoading(false)
     } catch (error: any) {
      setError(error.message)
      setLoading(false)
     }finally{
      setLoading(false)
     }
    }

    fetchData()
  }, [])

  useEffect(() => {
    const fetchRelatedProducts = async () => {
        setLoading(true)
      try{
        // Fetch related products
        const { data, error } = await supabase
            .from("products")
            .select("*")
            .eq("category_id", product?.category_id)
            .neq("id", productId)
            .eq("is_active", true)
            .limit(4)
        if (error) {
          setError(error.message)
        }
        setRelatedProducts(data as Product[])
        setLoading(false)
      } catch (error: any) {
        setError(error.message)
        setLoading(false)
      }finally{
        setLoading(false)
      }
    }
    product?.category_id !== "" && fetchRelatedProducts()
  }, [product])

  if(error){
    return (
      <div className="flex justify-center items-center h-screen">
        <p>{error}</p>
      </div>
    )
  }

  if(loading){
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
          {product?.images ? (
            <>
                <div className="w-full h-2/3">
                   {product.images.slice(0, 1).map((image) => (
                    <Image
                        key={image.id}
                        src={image.url || "https://placehold.co/600x400"}
                        alt={product.name}
                        fill
                        className="object-cover"
                        priority
                    />
                   ))}
                </div>
                <div className="flex w-full h-1/3 gap-2 mt-2">
                    {product.images.slice(1).map((image) => (
                        <Image
                            key={image.id}
                            src={image.url || "https://placehold.co/600x400"}
                            alt={product.name}
                            fill
                            className="object-cover"
                            priority
                        />
                    ))}
                </div>
            </>
          ) : (
            <div className="flex flex-col h-full w-full">
              <div className="w-full h-2/3">
                <img 
                  src="https://placehold.co/600x400?text=1" 
                  className="w-full h-full object-cover" 
                  alt="Main Product Image" 
                />
              </div>
              <div className="flex w-full h-1/3 gap-2 mt-2">
                {Array.from({ length: 3 }).map((_, index) => (
                  <img
                    key={`product-image-${index + 2}`}
                    src={`https://placehold.co/600x400?text=${index + 2}`}
                    className="w-1/3 h-full object-cover"
                    alt={`Product Image ${index + 2}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex flex-col space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product?.name}</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Category: {product?.category?.name || "Uncategorized"}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-2xl font-bold">{formatPrice(product?.price || 0)}</span>
            {product?.cost_price && (
              <span className="text-lg text-muted-foreground line-through">{formatPrice(product?.cost_price || 0)}</span>
            )}
          </div>

          <p className="text-muted-foreground">{product?.description}</p>

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
                <p>{product?.sku || "N/A"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Availability</h3>
                <p>{product && product?.inventory_quantity > 0 ? "In Stock" : "Out of Stock"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 ? 
        (<div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Related Products</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts?.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
            </div>
        </div>):
        (
        <div className="flex justify-center items-center h-screen">
          <p>No related products</p>
        </div>
      )}
    </div>
  )
}

