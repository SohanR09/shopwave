"use client"
import { getSupabaseBrowser } from "@/lib/supabase";
import { useEffect, useState } from "react";

interface UseIsWhislistItemProps {
    productId: string
    userId: string
}

export function useIsWhislistItem({productId, userId}: UseIsWhislistItemProps) {
    const [isWhislistItem, setIsWhislistItem] = useState(false)
    const supabase = getSupabaseBrowser()


    useEffect(() => {
        const fetchWishlistProducts = async () => {
          if(isWhislistItem){
            // Remove from wishlist
            await supabase.from("wishlists").delete().eq("user_id", userId).eq("product_id", productId)
            setIsWhislistItem(false)
          }else{
            const wishlist = await supabase.from("wishlists").select("*").eq("user_id", userId)
            if(wishlist.data){
              for(const item of wishlist.data){
                if(item.product_id === productId){
                  setIsWhislistItem(true)
                  return
                }
              }
            }else{
              setIsWhislistItem(false)
            }
          }
        }

        // fetch products if userId is provided
        if(userId){
          fetchWishlistProducts()
        }
      }, [userId])
    
    return {isWhislistItem, setIsWhislistItem}
}