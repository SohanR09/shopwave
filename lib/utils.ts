import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { getSupabaseBrowser } from "./supabase"

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
  return {session: data?.session, user: data?.session?.user, error: error}
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

