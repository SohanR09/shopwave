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

  const { data: userData, error: userError } = await supabase.from("users").select("*").eq("id", data?.session?.user?.id as string)

  return {
    session: data?.session, 
    user: {
      id: userData?.[0]?.id,
      email: userData?.[0]?.email,
      phone: userData?.[0]?.phone,
      name: userData?.[0]?.name,
      avatar_url: userData?.[0]?.avatar_url,
      created_at: userData?.[0]?.created_at,
      updated_at: userData?.[0]?.updated_at,
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

