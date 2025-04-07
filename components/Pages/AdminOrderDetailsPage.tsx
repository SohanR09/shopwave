"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getSupabaseBrowser } from "@/lib/supabase"
import type { Order, OrderItem, Address } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Separator } from "@/components/ui/separator"
import { getSession } from "@/lib/utils"

export default function OrderDetailsPage({ idParam }: { idParam: string }) {
    const [order, setOrder] = useState<Order | null>(null)
    const [orderItems, setOrderItems] = useState<OrderItem[]>([])
    const [shippingAddress, setShippingAddress] = useState<Address | null>(null)
    const [billingAddress, setBillingAddress] = useState<Address | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isUpdating, setIsUpdating] = useState(false)
    const router = useRouter()
    const { toast } = useToast()
    const supabase = getSupabaseBrowser()

    useEffect(() => {
        fetchOrderData()
    }, [])

    const fetchOrderData = async () => {
        setIsLoading(true)
        try {
            // Fetch order
            const { data: orderData, error: orderError } = await supabase
                .from("orders")
                .select("*, user:users(name, email)")
                .eq("id", idParam)
                .single()

            if (orderError) throw orderError
            setOrder(orderData as any)

            // Fetch order items
            const { data: itemsData, error: itemsError } = await supabase
                .from("order_items")
                .select("*")
                .eq("order_id", idParam)

            if (itemsError) throw itemsError
            setOrderItems(itemsData as any)

            // Fetch addresses if they exist
            if (orderData.shipping_address_id) {
                const { data: shippingData, error: shippingError } = await supabase
                    .from("addresses")
                    .select("*")
                    .eq("id", orderData.shipping_address_id)
                    .single()

                if (!shippingError) {
                    setShippingAddress(shippingData as any)
                }
            }

            if (orderData.billing_address_id) {
                const { data: billingData, error: billingError } = await supabase
                    .from("addresses")
                    .select("*")
                    .eq("id", orderData.billing_address_id)
                    .single()

                if (!billingError) {
                    setBillingAddress(billingData as any)
                }
            }
        } catch (error: any) {
            console.error("Error fetching order data:", error.message)
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load order data",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleStatusChange = async (status: string) => {
        if (!order) return
        if (!status) return

        if (status === order.status) {
            toast({
                title: "Order status is already set",
                description: "Please select a different status",
            })
            return
        }

        setIsUpdating(true)
        try {
            const { error } = await supabase.from("orders").update({ status }).eq("id", idParam)

            if (error) throw error

            setOrder({ ...order, status })

            toast({
                title: "Order updated",
                description: "Order status has been updated successfully",
            })
        } catch (error: any) {
            console.log("Error updating order status:", error.message)
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update order status",
            })
        } finally {
            setIsUpdating(false)
        }
    }

    const handlePaymentStatusChange = async (payment_status: string) => {
        if (!order) return
        if (!idParam) return

        setIsUpdating(true)
        try {
            const { error } = await supabase.from("orders").update({ payment_status }).eq("id", idParam)

            if (error) throw error

            setOrder({ ...order, payment_status })

            toast({
                title: "Order updated",
                description: "Payment status has been updated successfully",
            })
        } catch (error: any) {
            console.error("Error updating payment status:", error.message)
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update payment status",
            })
        } finally {
            setIsUpdating(false)
        }
    }

    if (isLoading) {
        return <div>Loading order data...</div>
    }

    if (!order) {
        return <div>Order not found</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.push("/admin/orders")}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Order #{order.order_number}</h1>
                    <p className="text-muted-foreground">
                        {order.created_at ? new Date(order.created_at).toLocaleDateString() : "N/A"}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="space-y-6 md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Items</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead className="text-right">Subtotal</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orderItems.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-4">
                                                No items found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        orderItems.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">
                                                    {item.name}
                                                    {item.sku && <div className="text-xs text-muted-foreground">SKU: {item.sku}</div>}
                                                </TableCell>
                                                <TableCell>${item.price.toFixed(2)}</TableCell>
                                                <TableCell>{item.quantity}</TableCell>
                                                <TableCell className="text-right">${item.subtotal.toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        {shippingAddress && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Shipping Address</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-1">
                                        <p>
                                            {shippingAddress.first_name} {shippingAddress.last_name}
                                        </p>
                                        {shippingAddress.company && <p>{shippingAddress.company}</p>}
                                        <p>{shippingAddress.address_line1}</p>
                                        {shippingAddress.address_line2 && <p>{shippingAddress.address_line2}</p>}
                                        <p>
                                            {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postal_code}
                                        </p>
                                        <p>{shippingAddress.country}</p>
                                        {shippingAddress.phone && <p>{shippingAddress.phone}</p>}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {billingAddress && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Billing Address</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-1">
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
                                        {billingAddress.phone && <p>{billingAddress.phone}</p>}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>${order.subtotal.toFixed(2)}</span>
                                </div>
                                {order.discount > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Discount</span>
                                        <span>-${order.discount.toFixed(2)}</span>
                                    </div>
                                )}
                                {order.shipping_cost > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Shipping</span>
                                        <span>${order.shipping_cost.toFixed(2)}</span>
                                    </div>
                                )}
                                {order.tax > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Tax</span>
                                        <span>${order.tax.toFixed(2)}</span>
                                    </div>
                                )}
                                <Separator />
                                <div className="flex justify-between font-medium">
                                    <span>Total</span>
                                    <span>${order.total.toFixed(2)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Customer</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-medium">{order.user ? order.user.name : "Guest"}</h3>
                                <p className="text-sm text-muted-foreground">{order.email}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Order Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Status</label>
                                <Select value={order.status} onValueChange={handleStatusChange} disabled={isUpdating}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="processing">Processing</SelectItem>
                                        <SelectItem value="shipped">Shipped</SelectItem>
                                        <SelectItem value="delivered">Delivered</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Payment Status</label>
                                <Select value={order.payment_status} onValueChange={handlePaymentStatusChange} disabled={isUpdating}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="paid">Paid</SelectItem>
                                        <SelectItem value="failed">Failed</SelectItem>
                                        <SelectItem value="refunded">Refunded</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {isUpdating && (
                                <div className="flex items-center justify-center">
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    <span className="text-sm">Updating...</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

