import { getSupabaseBrowser } from "./supabase"


export async function getWishlistItems({userId}: {userId: string}) {
    if (!userId) {
        console.log("No user ID provided")
        return []
    }
    try {
        const supabase = await getSupabaseBrowser()
        const { data, error } = await supabase
            .from("wishlists")
        .select(`
          id,
          product_id,
          created_at,
          product:products(
            id,
            name,
            slug,
            price,
            inventory_quantity,
            images:product_images(url),
            category:categories(
              id,
              name
            )
          )
        `)
        .eq("user_id", userId)

    if (error) {
        console.log("Error fetching wishlist:", error)
        return []
    }

        return data
    } catch (error: any) {
        console.log("Error fetching wishlist:", error)
        return []
    } finally {
        console.log("Wishlist fetched successfully")
    }
}