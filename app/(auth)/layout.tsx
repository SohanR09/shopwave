import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import { SessionProvider } from "@/components/providers/session-provider"
import AuthHeader from "@/components/layout/auth-header"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Authentication - ShopWave",
  description: "Sign in or create an account on ShopWave",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
      <main>
        <SessionProvider>
            <div className={inter.className}>
              <div className="flex min-h-screen h-full flex-col">
                <AuthHeader />
                <main className="flex-1 bg-gray-100">{children}</main>
                <Toaster />
              </div>
            </div>
        </SessionProvider>
      </main>
  )
}

