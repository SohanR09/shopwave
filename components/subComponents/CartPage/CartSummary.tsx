"use client"

import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User } from "@/types";
import { useState } from "react";
import Link from "next/link";
export default function CartSummary({ initialCartItems, user }: { initialCartItems: any[], user: User }) {
    const [couponCode, setCouponCode] = useState<string>("")

    // TODO: Calculate shipping and tax
    const shipping = 5
    const tax = 5

    const calculateSubtotal = () => {
        return initialCartItems.reduce((sum: number, item: any) => sum + item.product.price * item.quantity, 0)
    }

    const calculateTotal = () => {
        const subtotal = calculateSubtotal()
        // Add tax, shipping, etc. if needed
        return subtotal
    }
    return (
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
                    <span>{formatCurrency(shipping)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Tax</span>
                    <span>{formatCurrency(tax)}</span>
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
                <Button className="w-full bg-glacier-600 hover:bg-glacier-700">
                    <Link href="/checkout">Proceed to Checkout</Link>
                </Button>
            </CardFooter>
        </Card>
    )
}
