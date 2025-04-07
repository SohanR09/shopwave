"use client"

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loader2, Trash } from "lucide-react";
import { Card, CardTitle, CardHeader, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Minus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { User } from "@/types";
import { getSupabaseServer } from "@/lib/supabase";

export default function CartItems({ initialCartItems, user }: { initialCartItems: any[], user: User }) {

    const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({})
    const [cartItems, setCartItems] = useState<any[]>(initialCartItems)

    const supabase = getSupabaseServer()

    const updateQuantity = async (cartId: string, newQuantity: number) => {
        if (!user?.id || newQuantity < 1) return

        setIsUpdating((prev: Record<string, boolean>) => ({ ...prev, [cartId]: true }))
        try {
            const { error } = await supabase
                .from("carts")
                .update({ quantity: newQuantity })
                .eq("id", cartId)
                .eq("user_id", user.id)

            if (error) throw error

            // Update local state
            setCartItems((prev) => prev.map((item) => (item.id === cartId ? { ...item, quantity: newQuantity } : item)))
        } catch (error) {
            console.error("Error updating cart:", error)
        } finally {
            setIsUpdating((prev: Record<string, boolean>) => ({ ...prev, [cartId]: false }))
        }
    }

    const removeFromCart = async (cartId: string) => {
        if (!user?.id) return

        setIsUpdating((prev: Record<string, boolean>) => ({ ...prev, [cartId]: true }))
        try {
            const { error } = await supabase.from("carts").delete().eq("id", cartId).eq("user_id", user.id)

            if (error) throw error

            // Update local state
            setCartItems((prev) => prev.filter((item) => item.id !== cartId))
        } catch (error) {
            console.error("Error removing from cart:", error)
        } finally {
            setIsUpdating((prev: Record<string, boolean>) => ({ ...prev, [cartId]: false }))
        }
    }

    return (
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
                            <Link href={`/product/${item.product.id}`}>
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
                                        disabled={isUpdating[item.id]}
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
    )
}
