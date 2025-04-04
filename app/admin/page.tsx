"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getSupabaseBrowser } from "@/lib/supabase"
import { ShoppingBag, Users, DollarSign, Package } from "lucide-react"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalCustomers: 0,
    totalOrders: 0,
    totalRevenue: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const supabase = getSupabaseBrowser()

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true)

      try {
        // Get total products
        const { count: productsCount } = await supabase.from("products").select("*", { count: "exact", head: true })

        // Get total categories
        const { count: categoriesCount } = await supabase.from("categories").select("*", { count: "exact", head: true })

        // Get total customers
        const { count: customersCount } = await supabase.from("users").select("*", { count: "exact", head: true })

        // Get total orders
        const { count: ordersCount } = await supabase.from("orders").select("*", { count: "exact", head: true })

        // Get total revenue
        const { data: orders } = await supabase.from("orders").select("total").eq("status", "completed")

        const totalRevenue = orders?.reduce((sum, order) => sum + Number.parseFloat(order.total as any), 0) || 0

        setStats({
          totalProducts: productsCount || 0,
          totalCategories: categoriesCount || 0,
          totalCustomers: customersCount || 0,
          totalOrders: ordersCount || 0,
          totalRevenue,
        })
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [supabase])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your store</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-glacier-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "Loading..." : stats.totalCategories}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-glacier-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "Loading..." : stats.totalProducts}</div>
          </CardContent>
        </Card>

        <Card className="bg-glacier-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "Loading..." : stats.totalCustomers}</div>
          </CardContent>
        </Card>

        <Card className="bg-glacier-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "Loading..." : stats.totalOrders}</div>
          </CardContent>
        </Card>

        <Card className="bg-glacier-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "Loading..." : `$${stats.totalRevenue.toFixed(2)}`}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

