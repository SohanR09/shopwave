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

interface CartItem {
  id: string
  user_id: string
  product_id: string
  quantity: number
  created_at: string
  product: {
    id: string
    name: string
    slug: string
    price: number
    inventory_quantity: number
    images?: { url: string }[]
  }
}

export default function CartPage() {
  const router = useRouter()
  const supabase = getSupabaseBrowser()

  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({})
  const [couponCode, setCouponCode] = useState("")

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

  const updateQuantity = async (cartId: string, newQuantity: number) => {
    if (!session?.user?.id || newQuantity < 1) return

    setIsUpdating((prev) => ({ ...prev, [cartId]: true }))
    try {
      const { error } = await supabase
        .from("carts")
        .update({ quantity: newQuantity })
        .eq("id", cartId)
        .eq("user_id", session.user.id)

      if (error) throw error

      // Update local state
      setCartItems((prev) => prev.map((item) => (item.id === cartId ? { ...item, quantity: newQuantity } : item)))
    } catch (error) {
      console.error("Error updating cart:", error)
    } finally {
      setIsUpdating((prev) => ({ ...prev, [cartId]: false }))
    }
  }

  const removeFromCart = async (cartId: string) => {
    if (!session?.user?.id) return

    setIsUpdating((prev) => ({ ...prev, [cartId]: true }))
    try {
      const { error } = await supabase.from("carts").delete().eq("id", cartId).eq("user_id", session.user.id)

      if (error) throw error

      // Update local state
      setCartItems((prev) => prev.filter((item) => item.id !== cartId))
    } catch (error) {
      console.error("Error removing from cart:", error)
    } finally {
      setIsUpdating((prev) => ({ ...prev, [cartId]: false }))
    }
  }

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    // Add tax, shipping, etc. if needed
    return subtotal
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
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Cart Items ({cartItems.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row gap-4 py-4 border-b last:border-0">
                    <div className="relative w-full sm:w-24 h-24">
                      <Image
                        src={item.product.images?.[0]?.url || "/placeholder.svg?height=200&width=200"}
                        alt={item.product.name}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                    <div className="flex-1">
                      <Link href={`/product/${item.product.slug}`}>
                        <h3 className="font-medium hover:text-glacier-600">{item.product.name}</h3>
                      </Link>
                      <div className="mt-1 text-gray-500 text-sm">Price: {formatCurrency(item.product.price)}</div>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-r-none"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1 || isUpdating[item.id]}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <div className="h-8 px-3 flex items-center justify-center border-y">
                            {isUpdating[item.id] ? <Loader2 className="h-3 w-3 animate-spin" /> : item.quantity}
                          </div>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-l-none"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.inventory_quantity || isUpdating[item.id]}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => removeFromCart(item.id)}
                          disabled={isUpdating[item.id]}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-right font-medium">{formatCurrency(item.product.price * item.quantity)}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(calculateSubtotal())}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>Calculated at checkout</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(calculateTotal())}</span>
                </div>

                <div className="pt-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <Button variant="outline">Apply</Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-glacier-600 hover:bg-glacier-700">Proceed to Checkout</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

