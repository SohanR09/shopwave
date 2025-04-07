"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowser } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Trash, Loader2, Plus, Minus, ShoppingBag } from "lucide-react"
import { formatCurrency, getSession } from "@/lib/utils"
import CartItems from "../subComponents/CartPage/CartItems"
import CartSummary from "../subComponents/CartPage/CartSummary"
// import { CartItem } from "@/types"

export default function CartPage() {
  const router = useRouter()
  const supabase = getSupabaseBrowser()

  const [cartItems, setCartItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [couponCode, setCouponCode] = useState("")

  const [session, setSession] = useState<any | null>(null)
  const [user, setUser] = useState<any | null>(null)
  const [status, setStatus] = useState<any | null>(null)

  useEffect(() => {
    const fetchSession = async () => {
      const { session, user, error } = await getSession()
      if (error) {
        console.error("Error fetching session:", error)
      } else {
        setSession(session)
        setUser(user)
        setStatus(session?.user?.id ? "authenticated" : "unauthenticated")
      }
    }
    fetchSession()
  }, [])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin?callbackUrl=/cart")
    }

    if (status === "authenticated" && session.user) {
      fetchCart()
    }
  }, [status, session])

  const fetchCart = async () => {
    if (!session?.user?.id) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("carts")
        .select(`
          *,
          product:products(
            id,
            name,
            slug,
            price,
            inventory_quantity,
            images:product_images(url)
          )
        `)
        .eq("user_id", session.user.id)

      if (error) throw error
      setCartItems(data as any || [])
    } catch (error) {
      console.error("Error fetching cart:", error)
    } finally {
      setIsLoading(false)
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
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[40vh]">
          <Loader2 className="h-8 w-8 animate-spin text-glacier-600" />
        </div>
      ) : cartItems.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-2xl font-medium mb-4">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Looks like you haven't added any products to your cart yet.</p>
          <Button asChild className="bg-glacier-600 hover:bg-glacier-700">
            <Link href="/products">Start Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <CartItems initialCartItems={cartItems} user={user} />
          </div>

          {/* Cart Summary */}
          <div>
            <CartSummary initialCartItems={cartItems} user={user} />
          </div>
        </div>
      )}
    </div>
  )
}

