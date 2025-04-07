"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { getSupabaseBrowser } from "@/lib/supabase"
import { formatCurrency, getSession } from "@/lib/utils"
import { User } from "@/types"
import { CheckCircle, Loader2, Printer, ShoppingBag, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function OrderDetailsPageWrapper({ idParam, icon, title, description }: { idParam?: string, icon?: React.ReactNode, title?: string, description?: string }) {
    const router = useRouter()
    const params = useParams()
    const orderId = idParam || params.id as string
    const supabase = getSupabaseBrowser()

    const [order, setOrder] = useState<any>(null)
    const [orderItems, setOrderItems] = useState<any[]>([])
    const [shippingAddress, setShippingAddress] = useState<any>(null)
    const [billingAddress, setBillingAddress] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [user, setUser] = useState<User | null>(null)
    const [status, setStatus] = useState<"loading" | "unauthenticated" | "authenticated">("loading")

    useEffect(() => {
        const fetchSession = async () => {
            const { user } = await getSession()
            setStatus(user ? "authenticated" : "unauthenticated")
            setUser(user)
        }
        fetchSession()
    }, [])

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/signin")
        }

        if (status === "authenticated" && user) {
            fetchOrderDetails()
        }
    }, [status, orderId])

    const fetchOrderDetails = async () => {
        if (!user?.id || !orderId) return

        setIsLoading(true)
        try {
            // Fetch order
            const { data: orderData, error: orderError } = await supabase
                .from("orders")
                .select("*")
                .eq("id", orderId)
                .eq("user_id", user.id)
                .single()

            if (orderError) throw orderError
            if (!orderData) throw new Error("Order not found")

            setOrder(orderData)

            // Fetch order items
            const { data: itemsData, error: itemsError } = await supabase
                .from("order_items")
                .select("*")
                .eq("order_id", orderId)

            if (itemsError) throw itemsError
            setOrderItems(itemsData || [])

            // Fetch shipping address
            if (orderData.shipping_address_id) {
                const { data: shippingData, error: shippingError } = await supabase
                    .from("addresses")
                    .select("*")
                    .eq("id", orderData.shipping_address_id)
                    .single()

                if (shippingError) throw shippingError
                setShippingAddress(shippingData)
            }

            // Fetch billing address
            if (orderData.billing_address_id) {
                const { data: billingData, error: billingError } = await supabase
                    .from("addresses")
                    .select("*")
                    .eq("id", orderData.billing_address_id)
                    .single()

                if (billingError) throw billingError
                setBillingAddress(billingData)
            }
        } catch (error: any) {
            console.error("Error fetching order details:", error)
            setError(error.message || "Failed to load order details")
        } finally {
            setIsLoading(false)
        }
    }

    const handlePrint = () => {
        window.print()
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-glacier-600" />
            </div>
        )
    }

    if (error || !order) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <h1 className="text-3xl font-bold mb-4">Order Not Found</h1>
                <p className="mb-6">{error || "We couldn't find the order you're looking for."}</p>
                <Button asChild className="bg-glacier-600 hover:bg-glacier-700">
                    <Link href="/profile?tab=orders">View Your Orders</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <Button onClick={() => router.push("/profile?tab=orders")} variant="link" className="mb-4">
                <ArrowLeft className="h-4 w-4" />
                Back to Orders
            </Button>
            <div id="printable-content" className="max-w-4xl mx-auto bg-glacier-50 rounded-lg p-4 border border-glacier-200">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-2">
                        {icon || <CheckCircle className="h-16 w-16 text-green-500" />}
                        <h1 className="text-3xl font-bold">{title || ""}</h1>
                    </div>
                    <p className="text-gray-600 mb-4">
                        {description || ""}
                    </p>
                    <p className="text-gray-600">
                        Order #: <span className="font-medium">{order.order_number}</span> | Date:{" "}
                        <span className="font-medium">{new Date(order.created_at).toLocaleDateString()}</span>
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Shipping Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {shippingAddress ? (
                                <div>
                                    <p className="font-medium">
                                        {shippingAddress.first_name} {shippingAddress.last_name}
                                    </p>
                                    {shippingAddress.company && <p>{shippingAddress.company}</p>}
                                    <p>{shippingAddress.address_line1}</p>
                                    {shippingAddress.address_line2 && <p>{shippingAddress.address_line2}</p>}
                                    <p>
                                        {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postal_code}
                                    </p>
                                    <p>{shippingAddress.country}</p>
                                    {shippingAddress.phone && <p>Phone: {shippingAddress.phone}</p>}
                                </div>
                            ) : (
                                <p className="text-gray-500">No shipping address available</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>
                                <span className="font-medium">Payment Method:</span>{" "}
                                {order.payment_method === "credit_card" ? "Credit Card" : "PayPal"}
                            </p>
                            <p>
                                <span className="font-medium">Payment Status:</span>{" "}
                                <span
                                    className={
                                        order.payment_status === "paid"
                                            ? "text-green-600"
                                            : order.payment_status === "pending"
                                                ? "text-yellow-600"
                                                : "text-red-600"
                                    }
                                >
                                    {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                                </span>
                            </p>
                            <p>
                                <span className="font-medium">Order Status:</span>{" "}
                                <span
                                    className={
                                        order.status === "pending"
                                            ? "text-yellow-600"
                                            : order.status === "processing"
                                                ? "text-blue-600"
                                                : order.status === "shipped"
                                                    ? "text-green-600"
                                                    : order.status === "delivered"
                                                        ? "text-green-600"
                                                        : "text-red-600"
                                    }
                                >
                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </span>
                            </p>
                            {billingAddress && billingAddress.id !== shippingAddress?.id && (
                                <div className="mt-4">
                                    <p className="font-medium mb-2">Billing Address:</p>
                                    <p>
                                        {billingAddress.first_name} {billingAddress.last_name}
                                    </p>
                                    {billingAddress.company && <p>{billingAddress.company}</p>}
                                    <p>{billingAddress.address_line1}</p>
                                    {billingAddress.address_line2 && <p>{billingAddress.address_line2}</p>}
                                    <p>
                                        {billingAddress.city}, {billingAddress.state} {billingAddress.postal_code}
                                    </p>
                                    <p>{billingAddress.country}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {orderItems.map((item) => (
                                <div key={item.id} className="flex items-center border-b pb-4">
                                    <div className="flex-1">
                                        <h4 className="font-medium">{item.name}</h4>
                                        <p className="text-sm text-gray-500">
                                            Quantity: {item.quantity} × {formatCurrency(item.price)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">{formatCurrency(item.subtotal)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 space-y-2">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>{formatCurrency(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Shipping</span>
                                <span>{formatCurrency(order.shipping_cost)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Tax</span>
                                <span>{formatCurrency(order.tax)}</span>
                            </div>
                            {order.discount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Discount</span>
                                    <span>-{formatCurrency(order.discount)}</span>
                                </div>
                            )}
                            <Separator className="my-2" />
                            <div className="flex justify-between font-medium text-lg">
                                <span>Total</span>
                                <span>{formatCurrency(order.total)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex flex-col sm:flex-row justify-between items-center">
                    <Button asChild variant="outline" className="mb-4 sm:mb-0">
                        <Link href="/profile?tab=orders">
                            <ShoppingBag className="mr-2 h-4 w-4" />
                            View All Orders
                        </Link>
                    </Button>
                    <Button onClick={handlePrint} variant="outline">
                        <Printer className="mr-2 h-4 w-4" />
                        Print Receipt
                    </Button>
                </div>
            </div>
        </div>
    )
}

