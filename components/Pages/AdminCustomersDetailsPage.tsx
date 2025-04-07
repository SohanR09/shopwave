"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getSupabaseBrowser } from "@/lib/supabase"
import type { User, Order, Address } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Mail, Phone } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectValue, SelectTrigger, SelectContent, SelectItem } from "../ui/select"
import { getSession } from "@/lib/utils"
import { FormControl } from "../ui/form"
import { FormLabel } from "../ui/form"
import { Form } from "../ui/form"
import { FormItem } from "../ui/form"

export default function CustomerDetailsPage({ idParam }: { idParam: string }) {
    const [customer, setCustomer] = useState<User | null>(null)
    const [orders, setOrders] = useState<Order[]>([])
    const [addresses, setAddresses] = useState<Address[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()
    const { toast } = useToast()
    const supabase = getSupabaseBrowser()

    const [userRole, setUserRole] = useState<string | null>(null)
    const [isAdmin, setIsAdmin] = useState(false)

    useEffect(() => {
        const fetchUserRole = async () => {
            const { user } = await getSession()
            if (!idParam) return
            const { data: userRoleData, error: userRoleError } = await supabase
                .from("users")
                .select("role")
                .eq("id", idParam)
                .single()

            if (userRoleError) throw userRoleError
            setUserRole(userRoleData?.role as string)

            const { data: userData, error: userError } = await supabase
                .from("users")
                .select("role")
                .eq("id", user?.id)
                .single()

            setIsAdmin(userData?.role === "admin")
        }

        fetchUserRole()
    }, [idParam, supabase])

    useEffect(() => {
        const fetchCustomerData = async () => {
            if (!idParam) return
            setIsLoading(true)
            try {
                // Fetch customer
                const { data: userData, error: userError } = await supabase
                    .from("users")
                    .select("*")
                    .eq("id", idParam)
                    .single()

                if (userError) throw userError
                setCustomer(userData as any)

                // Fetch orders
                const { data: ordersData, error: ordersError } = await supabase
                    .from("orders")
                    .select("*")
                    .eq("user_id", idParam)
                    .order("created_at", { ascending: false })

                if (ordersError) throw ordersError
                setOrders(ordersData as any)

                // Fetch addresses
                const { data: addressesData, error: addressesError } = await supabase
                    .from("addresses")
                    .select("*")
                    .eq("user_id", idParam)

                if (addressesError) throw addressesError
                setAddresses(addressesData as any)
            } catch (error: any) {
                console.error("Error fetching customer data:", error.message)
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to load customer data",
                })
            } finally {
                setIsLoading(false)
            }
        }

        if (idParam) {
            fetchCustomerData()
        }
    }, [idParam, supabase, toast])

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
    }

    if (isLoading) {
        return <div>Loading customer data...</div>
    }

    if (!customer) {
        return <div>Customer not found</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.push("/admin/customers")}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{customer.name}</h1>
                    <p className="text-muted-foreground">Customer details</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Customer Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col items-center gap-2">
                            <Avatar className="h-24 w-24">
                                <AvatarImage src={customer.avatar_url || ""} />
                                <AvatarFallback className="text-2xl">{getInitials(customer.name)}</AvatarFallback>
                            </Avatar>
                            <h2 className="text-xl font-semibold">{customer.name}</h2>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span>{customer.email}</span>
                            </div>
                            {customer.phone && (
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span>{customer.phone}</span>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-md font-semibold text-glacier-800">Role</span>
                            <Select defaultValue={userRole || "user"} onValueChange={(value) => setUserRole(value)} disabled={!isAdmin}>
                                <SelectTrigger>
                                    <SelectValue placeholder={userRole} className="text-black" />
                                </SelectTrigger>
                                <SelectContent className="bg-white" >
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="user">User</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="pt-2">
                            <p className="text-sm text-muted-foreground">
                                Customer since {customer.created_at ? new Date(customer.created_at).toLocaleDateString() : "N/A"}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Tabs defaultValue="orders" className="col-span-1 md:col-span-2">
                    <Card className="w-full">
                        <CardHeader>
                            <TabsList className="bg-glacier-100">
                                <TabsTrigger value="orders">Orders</TabsTrigger>
                                <TabsTrigger value="addresses">Addresses</TabsTrigger>
                            </TabsList>
                        </CardHeader>
                        <CardContent>
                            <TabsContent value="orders" className="mt-0">
                                {orders.length === 0 ? (
                                    <div className="py-8 text-center">
                                        <p className="text-muted-foreground">No orders found</p>
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Order #</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Total</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {orders.map((order) => (
                                                <TableRow
                                                    key={order.id}
                                                    className="cursor-pointer"
                                                    onClick={() => router.push(`/admin/orders/${order.id}`)}
                                                >
                                                    <TableCell className="font-medium">{order.order_number}</TableCell>
                                                    <TableCell>
                                                        {order.created_at ? new Date(order.created_at).toLocaleDateString() : "N/A"}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span
                                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${order.status === "completed"
                                                                ? "bg-green-100 text-green-800"
                                                                : order.status === "processing"
                                                                    ? "bg-blue-100 text-blue-800"
                                                                    : order.status === "cancelled"
                                                                        ? "bg-red-100 text-red-800"
                                                                        : "bg-yellow-100 text-yellow-800"
                                                                }`}
                                                        >
                                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>${order.total.toFixed(2)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </TabsContent>
                            <TabsContent value="addresses" className="mt-0">
                                {addresses.length === 0 ? (
                                    <div className="py-8 text-center">
                                        <p className="text-muted-foreground">No addresses found</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        {addresses.map((address) => (
                                            <Card key={address.id}>
                                                <CardContent className="p-4">
                                                    <div className="flex justify-between">
                                                        <div className="font-medium">{address.type}</div>
                                                        {address.is_default && (
                                                            <span className="text-xs bg-glacier-100 text-glacier-800 rounded-full px-2 py-0.5">
                                                                Default
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="mt-2 space-y-1 text-sm">
                                                        <p>
                                                            {address.first_name} {address.last_name}
                                                        </p>
                                                        {address.company && <p>{address.company}</p>}
                                                        <p>{address.address_line1}</p>
                                                        {address.address_line2 && <p>{address.address_line2}</p>}
                                                        <p>
                                                            {address.city}, {address.state} {address.postal_code}
                                                        </p>
                                                        <p>{address.country}</p>
                                                        {address.phone && <p>{address.phone}</p>}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>
                        </CardContent>
                    </Card>
                </Tabs>
            </div>
        </div>
    )
}

