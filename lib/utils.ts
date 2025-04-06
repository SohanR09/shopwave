import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { getSupabaseBrowser } from "./supabase"
import { User } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export async function getSession() {
  const supabase = await getSupabaseBrowser()
  const { data, error } = await supabase.auth.getSession()
  return {
    session: data?.session, 
    user: {
      id: data?.session?.user?.id,
      email: data?.session?.user?.email,
      phone: data?.session?.user?.phone,
      name: data?.session?.user?.user_metadata?.name,
      avatar_url: data?.session?.user?.user_metadata?.avatar_url,
      created_at: data?.session?.user?.created_at,
      updated_at: data?.session?.user?.updated_at,
    } as User, 
    error: error}
}

export async function signOut() {
  const supabase = await getSupabaseBrowser()
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error("Error signing out:", error)
    }
    localStorage.clear()
    setTimeout(() => {
      window.location.reload()
  }, 500)
}

