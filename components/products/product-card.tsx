"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { getSupabaseBrowser } from "@/lib/supabase"
import { formatCurrency, getSession } from "@/lib/utils"
import type { Product } from "@/types"
import { Heart, ShoppingCart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "../ui/use-toast"
import { useIsMobile } from "@/hooks/use-mobile"
import { useIsWhislistItem } from "@/hooks/use-iswhislistitem"
import { addToCart } from "@/lib/addToCart"

interface ProductCardProps {
  product: Product
  removeFromWishlist?: () => void
}

export default function ProductCard({ product, removeFromWishlist }: ProductCardProps) {
  const isMobile = useIsMobile()
  const router = useRouter()
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false)
  const supabase = getSupabaseBrowser()

  const[user, setUser] = useState<any>(null)
  const[session, setSession] = useState<any>(null)

  const {isWhislistItem, setIsWhislistItem} = useIsWhislistItem({productId: product.id, userId: user?.id})
  const [showBag, setShowBag] = useState(false)
  useEffect(() => {
    const fetchSession = async () => {
      const {session, user} = await getSession()
      if(session){
        setSession(session)
        setUser(user)
      }else{
        setSession(null)
        setUser(null)
      }
    }
    fetchSession()
  }, [])


  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!session) {
      router.push("/signin?callbackUrl=/wishlist")
      return
    }

    setIsAddingToWishlist(true)

    try {
      if (isWhislistItem) {
        // Remove from wishlist
        await supabase.from("wishlists").delete().eq("user_id", session?.user?.id).eq("product_id", product.id)
        removeFromWishlist?.()
        setIsWhislistItem(false)
      } else {
        // Add to wishlist
        const { error } = await supabase.from("wishlists").insert({
          user_id: user?.id,
          product_id: product.id,
        })
        if (error) {
          console.log(error);
          
          toast({
            title: "Error adding to wishlist",
            description: error.message,
            variant: "destructive",
          })
        }
        setIsWhislistItem(true)
      }
    } catch (error) {
      console.error("Error updating wishlist:", error)
    } finally {
      setIsAddingToWishlist(false)
    }
  }

  const addingToCart = async (product: Product) => {
    if (!user?.id || !user?.email || !user?.name) {
      router.push("/signin")
      return
    }

    if(product){
      const { error, showBag, addedToCart } = await addToCart({product, userId: user.id})
      if (error) {
        console.log(error);
      }
      if(addedToCart){
        setShowBag(showBag)
      }
    }
  }

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="aspect-square relative">
        {product.images && product.images[0]?.url ? (
          <Image src={product.images[0].url || `https://placehold.co/600x400?text=${product.name}`} alt={product.name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <img src={`https://placehold.co/600x400?text=image`} className="object-cover w-full h-full" />
          </div>
        )}
        <button
          onClick={handleWishlist}
          disabled={isAddingToWishlist}
          className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white hover:text-red-900 transition-colors"
          aria-label={isWhislistItem ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`h-5 w-5 hover:cursor-pointer hover:text-red-600 hover:fill-red-600 ${isWhislistItem ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
        </button>
      </div>
      <CardContent className="p-4">
        <Link href={`/product/${product.id}`}>
          <h3 className="font-medium line-clamp-1 hover:underline underline-offset-2 hover:text-glacier-700 hover:cursor-pointer">{product.name}</h3>
        </Link>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{product.description}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div>
          <p className="font-semibold text-lg">{formatCurrency(product.price)}</p>
          {product.cost_price !== undefined && product.cost_price > product.price && (
            <p className="text-sm text-muted-foreground line-through">{product.cost_price === 0 ? "Free" : formatCurrency(product.cost_price)}</p>
          )} 
        </div>
        <div className="flex items-center gap-2">
          <Button 
            size="sm"
            className="bg-glacier-600 hover:bg-glacier-700" 
            onClick={() => router.push(`/product/${product.id}`)}
          >
            View
          </Button>
          <Button 
            size="sm"
            className="bg-glacier-600 hover:bg-glacier-700"
            onClick={() => addingToCart(product)}
          >
            {isMobile ? (<ShoppingCart className="h-4 w-4" />) : "Add to Cart"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

