import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Header from "@/components/layout/header"
import CategoryNav from "@/components/layout/category-nav"
import Footer from "@/components/layout/footer"
import { Toaster } from "@/components/ui/toaster"
import { SessionProvider } from "@/components/providers/session-provider"
import ScrollToTop from "@/components/subComponents/ScrollToTop"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ShopWave - Your Online Shopping Destination",
  description: "Shop the latest trends in fashion, electronics, home goods and more.",
  generator: 'v0.dev'
}

export default function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <SessionProvider>
          <div className={`flex min-h-screen flex-col ${inter.className}`}>
            <Header />
            <CategoryNav />
            <main className="flex-1">{children}</main>
            <Footer />
            <MobileNavMenu />
            <Toaster />
            <ScrollToTop />
          </div>
        </SessionProvider>
      </body>
    </html>
  )
}



import './globals.css'
import MobileNavMenu from "@/components/layout/mobile-nav"
