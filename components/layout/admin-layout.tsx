"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, ShoppingBag, Users, Package, FileText, Settings, LogOut, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { signOut } = useAuth()

  const routes = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      active: pathname === "/admin",
    },
     {
      label: "Categories",
      href: "/admin/categories",
      icon: Package,
      active: pathname.includes("/admin/categories"),
    },
    {
      label: "Products",
      href: "/admin/products",
      icon: ShoppingBag,
      active: pathname.includes("/admin/products"),
    },
    {
      label: "Customers",
      href: "/admin/customers",
      icon: Users,
      active: pathname.includes("/admin/customers"),
    },
    {
      label: "Orders",
      href: "/admin/orders",
      icon: FileText,
      active: pathname.includes("/admin/orders"),
    },
  ]

  return (
    <div className="h-full relative">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-glacier-600">
        <div className="flex flex-col h-full overflow-y-auto">
          <div className="px-6 py-4 border-b border-glacier-700">
            <Link href="/admin" className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white">Admin</h1>
            </Link>
          </div>
          <div className="flex-1 py-4">
            <nav className="flex flex-col gap-1 px-2">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    route.active
                      ? "bg-glacier-800 text-white"
                      : "text-glacier-100 hover:bg-glacier-700 hover:text-white",
                  )}
                >
                  <route.icon className="h-5 w-5" />
                  {route.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="p-4 border-t border-glacier-800">
            <Button
              variant="ghost"
              className="w-full justify-start text-glacier-100 hover:text-white hover:bg-glacier-800 hidden"
              onClick={() => signOut()}
            >
              <LogOut className="h-5 w-5 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
      <main className="md:pl-72 h-full">
        <div className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-white px-6 md:hidden">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </Button>
          <Link href="/admin" className="flex items-center gap-2">
            <h1 className="text-xl font-bold">Admin</h1>
          </Link>
        </div>
        {sidebarOpen && (
          <div className="fixed inset-0 z-[100] bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)}>
            <div className="fixed inset-y-0 left-0 z-[101] w-72 bg-glacier-950" onClick={(e) => e.stopPropagation()}>
              <div className="flex flex-col h-full overflow-y-auto">
                <div className="flex items-center justify-between px-6 py-4 border-b border-glacier-800">
                  <Link href="/admin" className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-white">Admin</h1>
                  </Link>
                  <Button variant="ghost" size="icon" className="text-white" onClick={() => setSidebarOpen(false)}>
                    <X className="h-6 w-6" />
                  </Button>
                </div>
                <div className="flex-1 py-4">
                  <nav className="flex flex-col gap-1 px-2">
                    {routes.map((route) => (
                      <Link
                        key={route.href}
                        href={route.href}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                          route.active
                            ? "bg-glacier-800 text-white"
                            : "text-glacier-100 hover:bg-glacier-800 hover:text-white",
                        )}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <route.icon className="h-5 w-5" />
                        {route.label}
                      </Link>
                    ))}
                  </nav>
                </div>
                <div className="p-4 border-t border-glacier-800">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-glacier-100 hover:text-white hover:bg-glacier-800 hidden"
                    onClick={() => signOut()}
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="p-6 h-full">{children}</div>
      </main>
    </div>
  )
}

