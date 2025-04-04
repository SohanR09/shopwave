"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowser } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Trash, ShoppingCart, Loader2 } from "lucide-react"
import { formatCurrency, getSession } from "@/lib/utils"

interface WishlistItem {
  id: string
  user_id: string
  product_id: string
  created_at: string
  product: {
    id: string
    name: string
    slug: string
    price: number
    compare_at_price?: number
    images?: { url: string }[]
  }
}

export default function WishlistPage() {
  const router = useRouter()
  const supabase = getSupabaseBrowser()
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRemoving, setIsRemoving] = useState<Record<string, boolean>>({})

  const [session, setSession] = useState<any | null>(null)
  const [user, setUser] = useState<any | null>(null)
  const [status, setStatus] = useState<any | null>(null)

  useEffect(() => {
    const fetchSession = async () => {
      const { session, user, error } = await getSession()
      if (error) {
        console.error("Error fetching session:", error)
      }else{
        setSession(session)
        setUser(user)
        setStatus(session?.user?.id ? "authenticated" : "unauthenticated")
      }
    }
    fetchSession()
  }, [] )

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin?callbackUrl=/wishlist")
    }

    if (status === "authenticated" && session.user) {
      fetchWishlist()
    }
  }, [status, session])

  const fetchWishlist = async () => {
    if (!session?.user?.id) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("wishlists")
        .select(`
          *,
          product:products(
            id,
            name,
            slug,
            price,
            compare_at_price,
            images:product_images(url)
          )
        `)
        .eq("user_id", session.user.id)

      if (error) throw error
      setWishlistItems(data as any || [])
    } catch (error) {
      console.error("Error fetching wishlist:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const removeFromWishlist = async (wishlistId: string) => {
    if (!session?.user?.id) return

    setIsRemoving((prev) => ({ ...prev, [wishlistId]: true }))
    try {
      const { error } = await supabase.from("wishlists").delete().eq("id", wishlistId).eq("user_id", session.user.id)

      if (error) throw error

      // Update local state
      setWishlistItems((prev) => prev.filter((item) => item.id !== wishlistId))
    } catch (error) {
      console.error("Error removing from wishlist:", error)
    } finally {
      setIsRemoving((prev) => ({ ...prev, [wishlistId]: false }))
    }
  }

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-glacier-600" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[40vh]">
          <Loader2 className="h-8 w-8 animate-spin text-glacier-600" />
        </div>
      ) : wishlistItems.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-medium mb-4">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-6">
            Add items to your wishlist to keep track of products you're interested in.
          </p>
          <Button asChild className="bg-glacier-600 hover:bg-glacier-700">
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="relative pt-[60%]">
                <Link href={`/product/${item.product.slug}`}>
                  <Image
                    src={item.product.images?.[0]?.url || "/placeholder.svg?height=300&width=400"}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                </Link>
              </div>
              <CardContent className="p-4">
                <Link href={`/product/${item.product.slug}`}>
                  <h3 className="font-medium text-lg mb-2 hover:text-glacier-600">{item.product.name}</h3>
                </Link>
                <div className="flex items-center mb-4">
                  <span className="font-medium text-gray-900">{formatCurrency(item.product.price)}</span>
                  {item.product.compare_at_price && item.product.compare_at_price > item.product.price && (
                    <span className="ml-2 text-sm text-gray-500 line-through">
                      {formatCurrency(item.product.compare_at_price)}
                    </span>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button className="flex-1 bg-glacier-600 hover:bg-glacier-700">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeFromWishlist(item.id)}
                    disabled={isRemoving[item.id]}
                  >
                    {isRemoving[item.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

