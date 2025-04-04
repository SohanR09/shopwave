"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Heart } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Product } from "@/types"
import { formatCurrency } from "@/lib/utils"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowser } from "@/lib/supabase"

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false)
  const supabase = getSupabaseBrowser()

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!session) {
      router.push("/signin?callbackUrl=/wishlist")
      return
    }

    setIsAddingToWishlist(true)

    try {
      if (isWishlisted) {
        // Remove from wishlist
        await supabase.from("wishlists").delete().eq("user_id", session.user.id).eq("product_id", product.id)

        setIsWishlisted(false)
      } else {
        // Add to wishlist
        await supabase.from("wishlists").insert({
          user_id: session.user.id,
          product_id: product.id,
        })

        setIsWishlisted(true)
      }
    } catch (error) {
      console.error("Error updating wishlist:", error)
    } finally {
      setIsAddingToWishlist(false)
    }
  }

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <Link href={`/product/${product.id}`}>
        <div className="aspect-square relative">
          {product.images && product.images[0] ? (
            <Image src={product.images[0] || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400">No image</span>
            </div>
          )}
          <button
            onClick={handleWishlist}
            disabled={isAddingToWishlist}
            className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={`h-5 w-5 ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
          </button>
        </div>
        <CardContent className="p-4">
          <h3 className="font-medium line-clamp-1">{product.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{product.description}</p>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-center">
          <div>
            <p className="font-semibold text-lg">{formatCurrency(product.price)}</p>
            {product.original_price && product.original_price > product.price && (
              <p className="text-sm text-muted-foreground line-through">{formatCurrency(product.original_price)}</p>
            )}
          </div>
          <Button size="sm" className="bg-glacier-600 hover:bg-glacier-700">
            View
          </Button>
        </CardFooter>
      </Link>
    </Card>
  )
}

