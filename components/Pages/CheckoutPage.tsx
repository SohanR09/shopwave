"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { getSupabaseBrowser } from "@/lib/supabase"
import { formatCurrency, getSession } from "@/lib/utils"
import { User } from "@/types"
import { Check, ChevronLeft, ChevronRight, CreditCard, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

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

interface Address {
    id: string
    user_id: string
    type: string
    first_name: string
    last_name: string
    company?: string
    address_line1: string
    address_line2?: string
    city: string
    state: string
    postal_code: string
    country: string
    phone?: string
    is_default: boolean
}

export default function CheckoutPage() {
    const router = useRouter()
    const supabase = getSupabaseBrowser()

    const [step, setStep] = useState(1)
    const [cartItems, setCartItems] = useState<CartItem[]>([])
    const [addresses, setAddresses] = useState<Address[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isProcessing, setIsProcessing] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Shipping details
    const [selectedShippingAddressId, setSelectedShippingAddressId] = useState<string>("")
    const [selectedBillingAddressId, setSelectedBillingAddressId] = useState<string>("")
    const [sameAsShipping, setSameAsShipping] = useState(true)
    const [shippingMethod, setShippingMethod] = useState("standard")

    // Payment details
    const [paymentMethod, setPaymentMethod] = useState("credit_card")
    const [cardNumber, setCardNumber] = useState("")
    const [cardName, setCardName] = useState("")
    const [cardExpiry, setCardExpiry] = useState("")
    const [cardCvc, setCardCvc] = useState("")

    // New address form
    const [showNewAddressForm, setShowNewAddressForm] = useState(false)
    const [addressType, setAddressType] = useState("shipping")
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [company, setCompany] = useState("")
    const [addressLine1, setAddressLine1] = useState("")
    const [addressLine2, setAddressLine2] = useState("")
    const [city, setCity] = useState("")
    const [state, setState] = useState("")
    const [postalCode, setPostalCode] = useState("")
    const [country, setCountry] = useState("")
    const [phone, setPhone] = useState("")
    const [isDefault, setIsDefault] = useState(false)
    const [isAddingAddress, setIsAddingAddress] = useState(false)

    // Order summary
    const [subtotal, setSubtotal] = useState(0)
    const [tax, setTax] = useState(0)
    const [shippingCost, setShippingCost] = useState(0)
    const [total, setTotal] = useState(0)
    const [couponCode, setCouponCode] = useState("")
    const [discount, setDiscount] = useState(0)

    const [status, setStatus] = useState<"loading" | "unauthenticated" | "authenticated">("loading")
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        const fetchSession = async () => {
            const session = await getSession()
            setStatus(session ? "authenticated" : "unauthenticated")
            setUser(session?.user)
        }
        fetchSession()
    }, [])

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/signin?callbackUrl=/checkout")
        }

        if (status === "authenticated" && user) {
            fetchCart()
            fetchAddresses()
        }
    }, [status])

    useEffect(() => {
        if (cartItems.length > 0) {
            calculateOrderSummary()
        }
    }, [cartItems, shippingMethod])

    const fetchCart = async () => {
        if (!user?.id) return

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
                .eq("user_id", user.id)

            if (error) throw error
            setCartItems(data as any || [])
        } catch (error) {
            console.error("Error fetching cart:", error)
            setError("Failed to load cart items. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    const fetchAddresses = async () => {
        if (!user?.id) return

        try {
            const { data, error } = await supabase
                .from("addresses")
                .select("*")
                .eq("user_id", user.id)
                .order("is_default", { ascending: false })

            if (error) throw error
            setAddresses(data as any || [])

            // Set default addresses if available
            const defaultShippingAddress = data?.find((addr) => addr.type === "shipping" && addr.is_default)
            const defaultBillingAddress = data?.find((addr) => addr.type === "billing" && addr.is_default)

            if (defaultShippingAddress) {
                setSelectedShippingAddressId(defaultShippingAddress.id as string)
            }

            if (defaultBillingAddress) {
                setSelectedBillingAddressId(defaultBillingAddress.id as string)
            }
        } catch (error) {
            console.error("Error fetching addresses:", error)
        }
    }

    const calculateOrderSummary = () => {
        const calculatedSubtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
        setSubtotal(calculatedSubtotal)

        // Calculate tax (example: 8%)
        const calculatedTax = calculatedSubtotal * 0.08
        setTax(calculatedTax)

        // Set shipping cost based on method
        let calculatedShippingCost = 0
        if (shippingMethod === "standard") {
            calculatedShippingCost = 5.99
        } else if (shippingMethod === "express") {
            calculatedShippingCost = 14.99
        }
        setShippingCost(calculatedShippingCost)

        // Calculate total
        setTotal(calculatedSubtotal + calculatedTax + calculatedShippingCost - discount)
    }

    const handleAddAddress = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user?.id) return

        setIsAddingAddress(true)
        setError(null)

        try {
            // If this is set as default, update all other addresses of this type to not be default
            if (isDefault) {
                await supabase
                    .from("addresses")
                    .update({ is_default: false })
                    .eq("user_id", user.id)
                    .eq("type", addressType)
            }

            // Add new address
            const { data, error } = await supabase
                .from("addresses")
                .insert({
                    user_id: user.id,
                    type: addressType,
                    first_name: firstName,
                    last_name: lastName,
                    company,
                    address_line1: addressLine1,
                    address_line2: addressLine2,
                    city,
                    state,
                    postal_code: postalCode,
                    country,
                    phone,
                    is_default: isDefault,
                })
                .select()

            if (error) throw error

            // Refresh addresses
            await fetchAddresses()

            // Select the new address
            if (data && data.length > 0) {
                if (addressType === "shipping") {
                    setSelectedShippingAddressId(data?.[0].id as string)
                } else {
                    setSelectedBillingAddressId(data?.[0].id as string)
                }
            }

            // Reset form
            setShowNewAddressForm(false)
            setFirstName("")
            setLastName("")
            setCompany("")
            setAddressLine1("")
            setAddressLine2("")
            setCity("")
            setState("")
            setPostalCode("")
            setCountry("")
            setPhone("")
            setIsDefault(false)
        } catch (error: any) {
            setError(error.message || "Error adding address")
        } finally {
            setIsAddingAddress(false)
        }
    }

    const handlePlaceOrder = async () => {
        if (!user?.id) return

        setIsProcessing(true)
        setError(null)
        try {
            // Get the selected addresses
            const shippingAddress = addresses.find((addr) => addr.id === selectedShippingAddressId)
            const billingAddress = sameAsShipping
                ? shippingAddress
                : addresses.find((addr) => addr.id === selectedBillingAddressId)

            if (!shippingAddress) {
                throw new Error("Please select a shipping address")
            }

            if (!sameAsShipping && !billingAddress) {
                throw new Error("Please select a billing address")
            }

            // Create order
            const { data: orderData, error: orderError } = await supabase
                .from("orders")
                .insert({
                    user_id: user.id,
                    order_number: `ORD-${Date.now()}`,
                    email: user.email,
                    status: "pending",
                    payment_status: "pending",
                    payment_method: paymentMethod,
                    subtotal,
                    tax,
                    shipping_cost: shippingCost,
                    discount,
                    total,
                    currency: "USD",
                    shipping_address_id: shippingAddress.id,
                    billing_address_id: sameAsShipping ? shippingAddress.id : billingAddress?.id,
                    created_at: new Date().toISOString(),
                })
                .select()

            if (orderError) {
                setError(orderError.message || "Failed to create order")
                return
            }

            if (!orderData || orderData.length === 0) {
                setError("Failed to create order")
                return
            }

            const orderId = orderData?.[0].id

            // Create order items
            const orderItems = cartItems.map((item) => ({
                order_id: orderId,
                product_id: item.product.id,
                name: item.product.name,
                price: item.product.price,
                quantity: item.quantity,
                subtotal: item.product.price * item.quantity,
            }))

            const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

            if (itemsError) {
                setError(itemsError.message || "Failed to create order items")
                return
            }

            // Clear cart
            const { error: clearCartError } = await supabase.from("carts").delete().eq("user_id", user.id)

            if (clearCartError) {
                setError(clearCartError.message || "Failed to clear cart")
                return
            }

            // Redirect to order confirmation
            router.push(`/order-confirmation/${orderId}`)
        } catch (error: any) {
            console.log("Error placing order:", error)
            setError(error.message || "Failed to place order. Please try again.")
            setIsProcessing(false)
        }
    }

    const handleApplyCoupon = () => {
        if (!couponCode.trim()) return

        // This is a simplified example - in a real app, you would validate the coupon code against your database
        if (couponCode.toUpperCase() === "SAVE10") {
            const discountAmount = subtotal * 0.1 // 10% discount
            setDiscount(discountAmount)
            setTotal(subtotal + tax + shippingCost - discountAmount)
        } else {
            setError("Invalid coupon code")
        }
    }

    if (status === "loading" || isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-glacier-600" />
            </div>
        )
    }

    if (cartItems.length === 0 && !isLoading) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
                <p className="mb-6">You don't have any items in your cart to checkout.</p>
                <Button asChild className="bg-glacier-600 hover:bg-glacier-700">
                    <Link href="/products">Continue Shopping</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Checkout</h1>

            {/* Checkout Steps */}
            <div className="mb-8">
                <div className="flex items-center justify-between max-w-3xl mx-auto">
                    <div className={`flex flex-col items-center ${step >= 1 ? "text-glacier-600" : "text-gray-400"}`}>
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${step >= 1 ? "bg-glacier-100 text-glacier-600" : "bg-gray-100 text-gray-400"
                                }`}
                        >
                            {step > 1 ? <Check className="h-5 w-5" /> : "1"}
                        </div>
                        <span className="text-sm font-medium">Shipping</span>
                    </div>
                    <div className={`w-24 h-1 ${step >= 2 ? "bg-glacier-600" : "bg-gray-200"}`}></div>
                    <div className={`flex flex-col items-center ${step >= 2 ? "text-glacier-600" : "text-gray-400"}`}>
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${step >= 2 ? "bg-glacier-100 text-glacier-600" : "bg-gray-100 text-gray-400"
                                }`}
                        >
                            {step > 2 ? <Check className="h-5 w-5" /> : "2"}
                        </div>
                        <span className="text-sm font-medium">Payment</span>
                    </div>
                    <div className={`w-24 h-1 ${step >= 3 ? "bg-glacier-600" : "bg-gray-200"}`}></div>
                    <div className={`flex flex-col items-center ${step >= 3 ? "text-glacier-600" : "text-gray-400"}`}>
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${step >= 3 ? "bg-glacier-100 text-glacier-600" : "bg-gray-100 text-gray-400"
                                }`}
                        >
                            3
                        </div>
                        <span className="text-sm font-medium">Review</span>
                    </div>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">
                    <p>{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2">
                    {/* Step 1: Shipping */}
                    {step === 1 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Shipping Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Shipping Address Selection */}
                                <div>
                                    <h3 className="text-lg font-medium mb-4">Select Shipping Address</h3>
                                    {addresses.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            {addresses
                                                .filter((addr) => addr.type === "shipping")
                                                .map((address) => (
                                                    <div
                                                        key={address.id}
                                                        className={`border rounded-md p-4 cursor-pointer ${selectedShippingAddressId === address.id
                                                            ? "border-glacier-600 bg-glacier-50"
                                                            : "border-gray-200 hover:border-glacier-300"
                                                            }`}
                                                        onClick={() => setSelectedShippingAddressId(address.id)}
                                                    >
                                                        <div className="flex justify-between">
                                                            <div>
                                                                <p className="font-medium">
                                                                    {address.first_name} {address.last_name}
                                                                </p>
                                                                {address.company && <p className="text-sm">{address.company}</p>}
                                                                <p className="text-sm">{address.address_line1}</p>
                                                                {address.address_line2 && <p className="text-sm">{address.address_line2}</p>}
                                                                <p className="text-sm">
                                                                    {address.city}, {address.state} {address.postal_code}
                                                                </p>
                                                                <p className="text-sm">{address.country}</p>
                                                                {address.phone && <p className="text-sm">{address.phone}</p>}
                                                            </div>
                                                            <div>
                                                                <div
                                                                    className={`w-5 h-5 rounded-full border ${selectedShippingAddressId === address.id
                                                                        ? "border-glacier-600 bg-glacier-600"
                                                                        : "border-gray-300"
                                                                        }`}
                                                                >
                                                                    {selectedShippingAddressId === address.id && (
                                                                        <div className="w-full h-full flex items-center justify-center">
                                                                            <div className="w-2 h-2 rounded-full bg-white"></div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 mb-4">You don't have any saved shipping addresses.</p>
                                    )}

                                    {!showNewAddressForm ? (
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setShowNewAddressForm(true)
                                                setAddressType("shipping")
                                            }}
                                        >
                                            Add New Address
                                        </Button>
                                    ) : addressType === "shipping" ? (
                                        <div className="mt-6 border p-4 rounded-md">
                                            <h4 className="font-medium mb-4">New Shipping Address</h4>
                                            <form onSubmit={handleAddAddress} className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="first-name">First Name</Label>
                                                        <Input
                                                            id="first-name"
                                                            value={firstName}
                                                            onChange={(e) => setFirstName(e.target.value)}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="last-name">Last Name</Label>
                                                        <Input
                                                            id="last-name"
                                                            value={lastName}
                                                            onChange={(e) => setLastName(e.target.value)}
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="company">Company (Optional)</Label>
                                                    <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="address-line1">Address Line 1</Label>
                                                    <Input
                                                        id="address-line1"
                                                        value={addressLine1}
                                                        onChange={(e) => setAddressLine1(e.target.value)}
                                                        required
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="address-line2">Address Line 2 (Optional)</Label>
                                                    <Input
                                                        id="address-line2"
                                                        value={addressLine2}
                                                        onChange={(e) => setAddressLine2(e.target.value)}
                                                    />
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="city">City</Label>
                                                        <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} required />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="state">State/Province</Label>
                                                        <Input id="state" value={state} onChange={(e) => setState(e.target.value)} required />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="postal-code">Postal Code</Label>
                                                        <Input
                                                            id="postal-code"
                                                            value={postalCode}
                                                            onChange={(e) => setPostalCode(e.target.value)}
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="country">Country</Label>
                                                        <Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} required />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="phone">Phone</Label>
                                                        <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        id="is-default"
                                                        checked={isDefault}
                                                        onChange={(e) => setIsDefault(e.target.checked)}
                                                        className="rounded border-gray-300"
                                                    />
                                                    <Label htmlFor="is-default">Set as default shipping address</Label>
                                                </div>

                                                <div className="flex space-x-2">
                                                    <Button
                                                        type="submit"
                                                        className="bg-glacier-600 hover:bg-glacier-700"
                                                        disabled={isAddingAddress}
                                                    >
                                                        {isAddingAddress ? (
                                                            <>
                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                Adding...
                                                            </>
                                                        ) : (
                                                            "Save Address"
                                                        )}
                                                    </Button>
                                                    <Button type="button" variant="outline" onClick={() => setShowNewAddressForm(false)}>
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </form>
                                        </div>
                                    ) : null}
                                </div>

                                <Separator />

                                {/* Billing Address */}
                                <div>
                                    <h3 className="text-lg font-medium mb-4">Billing Address</h3>
                                    <div className="flex items-center space-x-2 mb-4">
                                        <input
                                            type="checkbox"
                                            id="same-as-shipping"
                                            checked={sameAsShipping}
                                            onChange={(e) => setSameAsShipping(e.target.checked)}
                                            className="rounded border-gray-300"
                                        />
                                        <Label htmlFor="same-as-shipping">Same as shipping address</Label>
                                    </div>

                                    {!sameAsShipping && (
                                        <>
                                            {addresses.length > 0 ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                    {addresses
                                                        .filter((addr) => addr.type === "billing")
                                                        .map((address) => (
                                                            <div
                                                                key={address.id}
                                                                className={`border rounded-md p-4 cursor-pointer ${selectedBillingAddressId === address.id
                                                                    ? "border-glacier-600 bg-glacier-50"
                                                                    : "border-gray-200 hover:border-glacier-300"
                                                                    }`}
                                                                onClick={() => setSelectedBillingAddressId(address.id)}
                                                            >
                                                                <div className="flex justify-between">
                                                                    <div>
                                                                        <p className="font-medium">
                                                                            {address.first_name} {address.last_name}
                                                                        </p>
                                                                        {address.company && <p className="text-sm">{address.company}</p>}
                                                                        <p className="text-sm">{address.address_line1}</p>
                                                                        {address.address_line2 && <p className="text-sm">{address.address_line2}</p>}
                                                                        <p className="text-sm">
                                                                            {address.city}, {address.state} {address.postal_code}
                                                                        </p>
                                                                        <p className="text-sm">{address.country}</p>
                                                                        {address.phone && <p className="text-sm">{address.phone}</p>}
                                                                    </div>
                                                                    <div>
                                                                        <div
                                                                            className={`w-5 h-5 rounded-full border ${selectedBillingAddressId === address.id
                                                                                ? "border-glacier-600 bg-glacier-600"
                                                                                : "border-gray-300"
                                                                                }`}
                                                                        >
                                                                            {selectedBillingAddressId === address.id && (
                                                                                <div className="w-full h-full flex items-center justify-center">
                                                                                    <div className="w-2 h-2 rounded-full bg-white"></div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                </div>
                                            ) : (
                                                <p className="text-gray-500 mb-4">You don't have any saved billing addresses.</p>
                                            )}

                                            {!showNewAddressForm ? (
                                                <Button
                                                    variant="outline"
                                                    onClick={() => {
                                                        setShowNewAddressForm(true)
                                                        setAddressType("billing")
                                                    }}
                                                >
                                                    Add New Billing Address
                                                </Button>
                                            ) : addressType === "billing" ? (
                                                <div className="mt-6 border p-4 rounded-md">
                                                    <h4 className="font-medium mb-4">New Billing Address</h4>
                                                    <form onSubmit={handleAddAddress} className="space-y-4">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label htmlFor="first-name">First Name</Label>
                                                                <Input
                                                                    id="first-name"
                                                                    value={firstName}
                                                                    onChange={(e) => setFirstName(e.target.value)}
                                                                    required
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label htmlFor="last-name">Last Name</Label>
                                                                <Input
                                                                    id="last-name"
                                                                    value={lastName}
                                                                    onChange={(e) => setLastName(e.target.value)}
                                                                    required
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label htmlFor="company">Company (Optional)</Label>
                                                            <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} />
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label htmlFor="address-line1">Address Line 1</Label>
                                                            <Input
                                                                id="address-line1"
                                                                value={addressLine1}
                                                                onChange={(e) => setAddressLine1(e.target.value)}
                                                                required
                                                            />
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label htmlFor="address-line2">Address Line 2 (Optional)</Label>
                                                            <Input
                                                                id="address-line2"
                                                                value={addressLine2}
                                                                onChange={(e) => setAddressLine2(e.target.value)}
                                                            />
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                            <div className="space-y-2">
                                                                <Label htmlFor="city">City</Label>
                                                                <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} required />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label htmlFor="state">State/Province</Label>
                                                                <Input id="state" value={state} onChange={(e) => setState(e.target.value)} required />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label htmlFor="postal-code">Postal Code</Label>
                                                                <Input
                                                                    id="postal-code"
                                                                    value={postalCode}
                                                                    onChange={(e) => setPostalCode(e.target.value)}
                                                                    required
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label htmlFor="country">Country</Label>
                                                                <Input
                                                                    id="country"
                                                                    value={country}
                                                                    onChange={(e) => setCountry(e.target.value)}
                                                                    required
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label htmlFor="phone">Phone</Label>
                                                                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center space-x-2">
                                                            <input
                                                                type="checkbox"
                                                                id="is-default"
                                                                checked={isDefault}
                                                                onChange={(e) => setIsDefault(e.target.checked)}
                                                                className="rounded border-gray-300"
                                                            />
                                                            <Label htmlFor="is-default">Set as default billing address</Label>
                                                        </div>

                                                        <div className="flex space-x-2">
                                                            <Button
                                                                type="submit"
                                                                className="bg-glacier-600 hover:bg-glacier-700"
                                                                disabled={isAddingAddress}
                                                            >
                                                                {isAddingAddress ? (
                                                                    <>
                                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                        Adding...
                                                                    </>
                                                                ) : (
                                                                    "Save Address"
                                                                )}
                                                            </Button>
                                                            <Button type="button" variant="outline" onClick={() => setShowNewAddressForm(false)}>
                                                                Cancel
                                                            </Button>
                                                        </div>
                                                    </form>
                                                </div>
                                            ) : null}
                                        </>
                                    )}
                                </div>

                                <Separator />

                                {/* Shipping Method */}
                                <div>
                                    <h3 className="text-lg font-medium mb-4">Shipping Method</h3>
                                    <RadioGroup value={shippingMethod} onValueChange={setShippingMethod} className="space-y-3">
                                        <div className="flex items-center space-x-3 border p-4 rounded-md">
                                            <RadioGroupItem value="standard" id="standard" />
                                            <Label htmlFor="standard" className="flex-1">
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className="font-medium">Standard Shipping</p>
                                                        <p className="text-sm text-gray-500">Delivery in 5-7 business days</p>
                                                    </div>
                                                    <p className="font-medium">$5.99</p>
                                                </div>
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-3 border p-4 rounded-md">
                                            <RadioGroupItem value="express" id="express" />
                                            <Label htmlFor="express" className="flex-1">
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className="font-medium">Express Shipping</p>
                                                        <p className="text-sm text-gray-500">Delivery in 1-3 business days</p>
                                                    </div>
                                                    <p className="font-medium">$14.99</p>
                                                </div>
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <Button variant="outline" asChild>
                                    <Link href="/cart">
                                        <ChevronLeft className="mr-2 h-4 w-4" />
                                        Back to Cart
                                    </Link>
                                </Button>
                                <Button
                                    className="bg-glacier-600 hover:bg-glacier-700"
                                    onClick={() => setStep(2)}
                                    disabled={!selectedShippingAddressId || (!sameAsShipping && !selectedBillingAddressId)}
                                >
                                    Continue to Payment
                                    <ChevronRight className="ml-2 h-4 w-4" />
                                </Button>
                            </CardFooter>
                        </Card>
                    )}

                    {/* Step 2: Payment */}
                    {step === 2 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Payment Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-medium mb-4">Payment Method</h3>
                                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                                        <div className="flex items-center space-x-3 border p-4 rounded-md">
                                            <RadioGroupItem value="credit_card" id="credit_card" />
                                            <Label htmlFor="credit_card" className="flex-1">
                                                <div className="flex items-center">
                                                    <CreditCard className="mr-2 h-5 w-5" />
                                                    <span>Credit / Debit Card</span>
                                                </div>
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-3 border p-4 rounded-md">
                                            <RadioGroupItem value="paypal" id="paypal" />
                                            <Label htmlFor="paypal" className="flex-1">
                                                <div className="flex items-center">
                                                    <span className="font-bold text-blue-700 mr-1">Pay</span>
                                                    <span className="font-bold text-blue-900">Pal</span>
                                                </div>
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                {paymentMethod === "credit_card" && (
                                    <div className="space-y-4 mt-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="card-number">Card Number</Label>
                                            <Input
                                                id="card-number"
                                                placeholder="1234 5678 9012 3456"
                                                value={cardNumber}
                                                onChange={(e) => setCardNumber(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="card-name">Name on Card</Label>
                                            <Input
                                                id="card-name"
                                                placeholder="John Doe"
                                                value={cardName}
                                                onChange={(e) => setCardName(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="card-expiry">Expiration Date (MM/YY)</Label>
                                                <Input
                                                    id="card-expiry"
                                                    placeholder="MM/YY"
                                                    value={cardExpiry}
                                                    onChange={(e) => setCardExpiry(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="card-cvc">CVC</Label>
                                                <Input
                                                    id="card-cvc"
                                                    placeholder="123"
                                                    value={cardCvc}
                                                    onChange={(e) => setCardCvc(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {paymentMethod === "paypal" && (
                                    <div className="mt-4 p-4 bg-gray-50 rounded-md text-center">
                                        <p className="mb-4">You will be redirected to PayPal to complete your payment.</p>
                                        <Button className="bg-blue-600 hover:bg-blue-700">Continue with PayPal</Button>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <Button variant="outline" onClick={() => setStep(1)}>
                                    <ChevronLeft className="mr-2 h-4 w-4" />
                                    Back to Shipping
                                </Button>
                                <Button
                                    className="bg-glacier-600 hover:bg-glacier-700"
                                    onClick={() => setStep(3)}
                                    disabled={paymentMethod === "credit_card" && (!cardNumber || !cardName || !cardExpiry || !cardCvc)}
                                >
                                    Review Order
                                    <ChevronRight className="ml-2 h-4 w-4" />
                                </Button>
                            </CardFooter>
                        </Card>
                    )}

                    {/* Step 3: Review */}
                    {step === 3 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Review Your Order</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Order Items */}
                                <div>
                                    <h3 className="text-lg font-medium mb-4">Order Items</h3>
                                    <div className="space-y-4">
                                        {cartItems.map((item) => (
                                            <div key={item.id} className="flex items-center border-b pb-4">
                                                <div className="relative w-16 h-16 flex-shrink-0">
                                                    <Image
                                                        src={item.product.images?.[0]?.url || "/placeholder.svg?height=64&width=64"}
                                                        alt={item.product.name}
                                                        fill
                                                        className="object-cover rounded"
                                                    />
                                                </div>
                                                <div className="ml-4 flex-1">
                                                    <h4 className="font-medium">{item.product.name}</h4>
                                                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium">{formatCurrency(item.product.price * item.quantity)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Shipping Information */}
                                <div>
                                    <h3 className="text-lg font-medium mb-4">Shipping Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="font-medium mb-2">Shipping Address</h4>
                                            {addresses.find((addr) => addr.id === selectedShippingAddressId) ? (
                                                <div className="text-sm">
                                                    <p>
                                                        {addresses.find((addr) => addr.id === selectedShippingAddressId)?.first_name}{" "}
                                                        {addresses.find((addr) => addr.id === selectedShippingAddressId)?.last_name}
                                                    </p>
                                                    {addresses.find((addr) => addr.id === selectedShippingAddressId)?.company && (
                                                        <p>{addresses.find((addr) => addr.id === selectedShippingAddressId)?.company}</p>
                                                    )}
                                                    <p>{addresses.find((addr) => addr.id === selectedShippingAddressId)?.address_line1}</p>
                                                    {addresses.find((addr) => addr.id === selectedShippingAddressId)?.address_line2 && (
                                                        <p>{addresses.find((addr) => addr.id === selectedShippingAddressId)?.address_line2}</p>
                                                    )}
                                                    <p>
                                                        {addresses.find((addr) => addr.id === selectedShippingAddressId)?.city},{" "}
                                                        {addresses.find((addr) => addr.id === selectedShippingAddressId)?.state}{" "}
                                                        {addresses.find((addr) => addr.id === selectedShippingAddressId)?.postal_code}
                                                    </p>
                                                    <p>{addresses.find((addr) => addr.id === selectedShippingAddressId)?.country}</p>
                                                    {addresses.find((addr) => addr.id === selectedShippingAddressId)?.phone && (
                                                        <p>{addresses.find((addr) => addr.id === selectedShippingAddressId)?.phone}</p>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-gray-500">No shipping address selected</p>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-medium mb-2">Billing Address</h4>
                                            {sameAsShipping ? (
                                                <div className="text-sm">
                                                    <p>Same as shipping address</p>
                                                </div>
                                            ) : addresses.find((addr) => addr.id === selectedBillingAddressId) ? (
                                                <div className="text-sm">
                                                    <p>
                                                        {addresses.find((addr) => addr.id === selectedBillingAddressId)?.first_name}{" "}
                                                        {addresses.find((addr) => addr.id === selectedBillingAddressId)?.last_name}
                                                    </p>
                                                    {addresses.find((addr) => addr.id === selectedBillingAddressId)?.company && (
                                                        <p>{addresses.find((addr) => addr.id === selectedBillingAddressId)?.company}</p>
                                                    )}
                                                    <p>{addresses.find((addr) => addr.id === selectedBillingAddressId)?.address_line1}</p>
                                                    {addresses.find((addr) => addr.id === selectedBillingAddressId)?.address_line2 && (
                                                        <p>{addresses.find((addr) => addr.id === selectedBillingAddressId)?.address_line2}</p>
                                                    )}
                                                    <p>
                                                        {addresses.find((addr) => addr.id === selectedBillingAddressId)?.city},{" "}
                                                        {addresses.find((addr) => addr.id === selectedBillingAddressId)?.state}{" "}
                                                        {addresses.find((addr) => addr.id === selectedBillingAddressId)?.postal_code}
                                                    </p>
                                                    <p>{addresses.find((addr) => addr.id === selectedBillingAddressId)?.country}</p>
                                                    {addresses.find((addr) => addr.id === selectedBillingAddressId)?.phone && (
                                                        <p>{addresses.find((addr) => addr.id === selectedBillingAddressId)?.phone}</p>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-gray-500">No billing address selected</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Shipping Method */}
                                <div>
                                    <h3 className="text-lg font-medium mb-2">Shipping Method</h3>
                                    <p>
                                        {shippingMethod === "standard"
                                            ? "Standard Shipping (5-7 business days)"
                                            : "Express Shipping (1-3 business days)"}
                                    </p>
                                </div>

                                {/* Payment Method */}
                                <div>
                                    <h3 className="text-lg font-medium mb-2">Payment Method</h3>
                                    <p>
                                        {paymentMethod === "credit_card" ? `Credit Card (ending in ${cardNumber.slice(-4)})` : "PayPal"}
                                    </p>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <Button variant="outline" onClick={() => setStep(2)}>
                                    <ChevronLeft className="mr-2 h-4 w-4" />
                                    Back to Payment
                                </Button>
                                <Button
                                    className="bg-glacier-600 hover:bg-glacier-700"
                                    onClick={handlePlaceOrder}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        "Place Order"
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    )}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-24">
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                                <span>{formatCurrency(subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Shipping</span>
                                <span>{formatCurrency(shippingCost)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Tax</span>
                                <span>{formatCurrency(tax)}</span>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Discount</span>
                                    <span>-{formatCurrency(discount)}</span>
                                </div>
                            )}
                            <Separator />
                            <div className="flex justify-between font-medium text-lg">
                                <span>Total</span>
                                <span>{formatCurrency(total)}</span>
                            </div>

                            <div className="pt-4">
                                <div className="flex gap-2">
                                    <Input placeholder="Coupon code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
                                    <Button variant="outline" onClick={handleApplyCoupon}>
                                        Apply
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}


