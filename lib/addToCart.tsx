"use client"

import { Product, User } from "@/types"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { getSupabaseServer } from "./supabase"
import { getSession } from "./utils"

interface AddToCartProps {
    product: Product
    userId: string
}

export async function addToCart({product, userId}: AddToCartProps) {
    const supabase = getSupabaseServer()
    if (!product) {
        return {
            error: "Product not found",
            showBag: false,
            addedToCart: false
        }
    }
    
    const { data: cartData, error: cartError } = await supabase.from("carts").select("*").eq("user_id", userId).eq("product_id", product.id).single()
    // error if cart is not found
    if (cartError?.details  === "The result contains 0 rows") {
        // return {
        //     error: cartError.message,
        //     showBag: false,
        //     addedToCart: false
        // }
    }

    // if cart product is found, update quantity of cart product
    if (cartData) {
        const { error: cartUpdateError } = await supabase.from("carts").update({
            quantity: cartData.quantity + 1
        }).eq("id", cartData.id)

        // error at cart update
        if (cartUpdateError) {
            return {
                error: cartUpdateError.message,
                showBag: false,
                addedToCart: false
            }
        }

        // success at cart update
        return {
            error: null,
            showBag: true,
            addedToCart: true
        }
    }

    // if cart product is not found, create add cart product
    const { error: cartInsertError } = await supabase.from("carts").insert({
        user_id: userId,
        product_id: product.id,
        quantity: 1
    })

    // error at cart insert
    if (cartInsertError) {
        return {
            error: cartInsertError.message,
            showBag: false,
            addedToCart: false
        }
    }

    // success at cart insert
    return {
        error: null,
        showBag: true,
        addedToCart: true
    }
}
