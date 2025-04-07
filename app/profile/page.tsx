"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { getSupabaseBrowser } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Heart, Loader2, Settings, Upload, Bell, ShoppingBag, User, LucideIcon, Lock, LogOut, Trash } from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import { cn, getSession, signOut } from "@/lib/utils"
import { Order, Review } from "@/types"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { getWishlistItems } from "@/lib/getAllData"
import { AlertDialogFooter } from "@/components/ui/alert-dialog"
import CommingSoon from "@/components/subComponents/shared/CommingSoon"

interface MenuItem {
  icon: LucideIcon
  label: string
  value: string
}

export default function ProfilePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tab = searchParams.get("tab") || "overview"
  const supabase = getSupabaseBrowser()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [wishlistItems, setWishlistItems] = useState<any[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [loadingReviews, setLoadingReviews] = useState(false)
  const [loadingWishlist, setLoadingWishlist] = useState(false)
  const [disableOverview, setDisableOverview] = useState(true)

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [changingPassword, setChangingPassword] = useState(false)

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [orderUpdates, setOrderUpdates] = useState(true)
  const [promotionalEmails, setPromotionalEmails] = useState(true)
  const [savingNotifications, setSavingNotifications] = useState(false)

  // Session state
  const [session, setSession] = useState<any | null>(null)
  const [user, setUser] = useState<any | null>(null)
  const [status, setStatus] = useState<any | null>(null)

  useEffect(() => {
    const fetchSession = async () => {
      const { session, user, error } = await getSession()
      if (error) {
        console.error("Error fetching session:", error)
      } else {
        setSession(session)
        console.log("user:", user)
        setUser(user)
        setStatus(session?.user?.id ? "authenticated" : "unauthenticated")
      }
    }
    fetchSession()
  }, [])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin?callbackUrl=/profile")
    }
    if (status === "authenticated" && session.user) {
      fetchUserProfile()
    }
  }, [status, session])

  useEffect(() => {
    if (status === "authenticated" && session.user) {
      setLoadingWishlist(true)
      const fetchWishlist = async () => {
        try {
          const wishlistItems = await getWishlistItems({ userId: session.user.id })
          setWishlistItems(wishlistItems)
        } catch (error: any) {
          console.log("Error fetching wishlist items:", error.message)
          setError(error.message || "Error fetching wishlist items")
        } finally {
          setLoadingWishlist(false)
        }
      }
      fetchWishlist()
      fetchOrders()
    }
  }, [status, session])

  useEffect(() => {
    if (name && phone) {
      setDisableOverview(false)
    }
  }, [name, phone])

  const fetchUserProfile = async () => {
    if (!session?.user?.id) return

    try {
      const { data, error } = await supabase.from("users").select("*").eq("id", session.user.id).single()

      if (error) throw error

      if (data) {
        setName(data.name as string || "")
        setEmail(data.email as string || "")
        setPhone(data.phone as string || "")
        setAvatarUrl(data.avatar_url as string || "")
      }
    } catch (error: any) {
      console.error("Error fetching user profile:", error.message)
    }
  }

  const fetchOrders = async () => {
    if (!session?.user?.id) return

    try {
      const { data, error } = await supabase.from("orders").select("*").eq("user_id", session.user.id)

      if (error) setError(error.message || "Error fetching orders")
      console.log("orders:", data)
      setOrders(data as any || [])
    } catch (error: any) {
      setError(error.message || "Error fetching orders")
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !session?.user?.id) return

    const file = e.target.files[0]
    const fileExt = file.name.split(".").pop()
    const fileName = `${uuidv4()}.${fileExt}`
    const filePath = `profiles/${session.user.id}/${fileName}`

    setIsUploading(true)

    try {
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage.from("profiles").upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: signedUrlData } = await supabase.storage.from("profiles").createSignedUrl(filePath, 525600)

      // Update avatar URL in user profile
      const { error: updateError } = await supabase
        .from("users")
        .update({ avatar_url: signedUrlData?.signedUrl })
        .eq("id", session.user.id)

      if (updateError) throw updateError

      setAvatarUrl(signedUrlData?.signedUrl || "")
      setSuccess("Profile picture updated successfully")
    } catch (error: any) {
      setError(error.message || "Error uploading avatar")
    } finally {
      setIsUploading(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user?.id) return

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const { error } = await supabase
        .from("users")
        .update({
          name,
          phone,
          updated_at: new Date().toISOString(),
        })
        .eq("id", session.user.id)

      if (error) throw error

      setSuccess("Profile updated successfully")
    } catch (error: any) {
      setError(error.message || "Error updating profile")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveFromWishlist = async (wishlistId: string) => {
    if (!user?.id) return

    try {
      const { error } = await supabase.from("wishlists").delete().eq("id", wishlistId).eq("user_id", user?.id)

      if (error) throw error

      // Update local state
      setWishlistItems((prev) => prev.filter((item) => item.id !== wishlistId))
      setSuccess("Item removed from wishlist")
    } catch (error: any) {
      setError(error.message || "Error removing item from wishlist")
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return

    setChangingPassword(true)
    setError(null)
    setSuccess(null)

    try {
      if (newPassword !== confirmPassword) {
        setError("New passwords do not match")
        return
      }

      // In a real app, you would verify the current password and update with the new one
      // This is a simplified example
      const { error } = await supabase.auth.updateUser({ password: newPassword })

      if (error) setError(error.message || "Error updating password")

      setSuccess("Password updated successfully")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error: any) {
      setError(error.message || "Error updating password")
    } finally {
      setChangingPassword(false)
    }
  }

  const handleSignOut = async () => {
    setStatus("loading")
    signOut()
  }

  const menuItems: MenuItem[] = [
    { icon: User, label: "Overview", value: "overview" },
    { icon: ShoppingBag, label: "Orders", value: "orders" },
    { icon: Heart, label: "Wishlist", value: "wishlist" },
    { icon: Bell, label: "Notifications", value: "notifications" },
    { icon: Lock, label: "Security", value: "security" },
    { icon: Settings, label: "Settings", value: "settings" },
  ]

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-glacier-600" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Account</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col items-center mb-6 pt-4">
                <Avatar className="h-20 w-20 mb-4">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                </Avatar>
                <h2 className="text-lg font-medium">{name || "User"}</h2>
                <p className="text-sm text-gray-500">{email}</p>
              </div>

              <Separator className="mb-4" />

              <nav className="space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.value}
                    href={`/profile?tab=${item.value}`}
                    className={cn(
                      "flex items-center px-3 py-2 text-sm rounded-md w-full",
                      tab === item.value
                        ? "bg-glacier-50 text-glacier-700 font-medium"
                        : "text-gray-700 hover:bg-gray-100",
                    )}
                  >
                    <item.icon className="mr-3 h-4 w-4" />
                    {item.label}
                  </Link>
                ))}
                <button
                  onClick={handleSignOut}
                  className="flex items-center px-3 py-2 text-sm rounded-md w-full text-red-600 hover:bg-red-50"
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  Sign Out
                </button>
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="md:col-span-3">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Overview Tab */}
          {tab === "overview" && (
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information and profile picture</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="flex flex-col items-center space-y-4">
                    <Avatar className="h-32 w-32">
                      <AvatarImage src={avatarUrl} />
                      <AvatarFallback className="text-2xl">{name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex items-center">
                      <label className="cursor-pointer">
                        <div className="flex items-center space-x-2 text-sm text-glacier-600 hover:text-glacier-700">
                          <Upload className="h-4 w-4" />
                          <span>{isUploading ? "Uploading..." : "Change profile picture"}</span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarUpload}
                          disabled={isUploading}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex-1">
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" value={name} onChange={(e) => {
                          const newName = e.target.value;
                          setName(newName);
                        }} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" value={email} disabled className="bg-gray-50" />
                        <p className="text-sm text-red-500 flex items-center gap-2 bg-red-50 p-2 rounded-md">
                          <Lock className="h-4 w-4" />
                          Email cannot be changed. Contact support for assistance.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                      </div>
                      <Button type="submit" className="bg-glacier-600 hover:bg-glacier-700" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                    </form>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Orders Tab */}
          {tab === "orders" && (
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>View and track your orders</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingOrders ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-glacier-600" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingBag className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No orders yet</h3>
                    <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
                    <Button asChild className="bg-glacier-600 hover:bg-glacier-700">
                      <Link href="/products">Start Shopping</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                        <tr>
                          <th className="px-4 py-3 text-left">Order #</th>
                          <th className="px-4 py-3 text-left">Date</th>
                          <th className="px-4 py-3 text-left">Order Status</th>
                          <th className="px-4 py-3 text-left">Payment Status</th>
                          <th className="px-4 py-3 text-right">Total</th>
                          <th className="px-4 py-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {orders?.map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4 text-sm">{order.order_number}</td>
                            <td className="px-4 py-4 text-sm">{new Date(order?.created_at || "").toLocaleDateString()}</td>
                            <td className="px-4 py-4 text-sm">
                              <span
                                className={cn(
                                  "px-2 py-1 rounded-full text-xs",
                                  order.status === "completed"
                                    ? "bg-green-100 text-green-800"
                                    : order.status === "processing"
                                      ? "bg-blue-100 text-blue-800"
                                      : order.status === "cancelled"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-yellow-100 text-yellow-800",
                                )}
                              >
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-sm">
                              <span
                                className={cn(
                                  "px-2 py-1 rounded-full text-xs",
                                  order.payment_status === "paid"
                                    ? "bg-green-100 text-green-800"
                                    : order.payment_status === "pending"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800",
                                )}
                              >
                                {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-sm text-right">${order.total.toFixed(2)}</td>
                            <td className="px-4 py-4 text-sm text-center">
                              <Button asChild variant="outline" size="sm">
                                <Link href={`/order/${order.id}`}>View</Link>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Wishlist Tab */}
          {tab === "wishlist" && (
            <Card>
              <CardHeader>
                <CardTitle>My Wishlist</CardTitle>
                <CardDescription>Products you've saved for later</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingWishlist ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-glacier-600" />
                  </div>
                ) : wishlistItems.length === 0 ? (
                  <div className="text-center py-8">
                    <Heart className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium mb-2">Your wishlist is empty</h3>
                    <p className="text-gray-500 mb-4">Save items you like to your wishlist.</p>
                    <Button asChild className="bg-glacier-600 hover:bg-glacier-700">
                      <Link href="/products">Browse Products</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {wishlistItems.map((item) => (
                      <Card key={item.id} className="overflow-hidden">
                        <CardHeader>
                          <CardTitle>
                            <div className="flex items-center">
                              <div className="relative w-20 h-20 flex-shrink-0">
                                <img
                                  src={item?.product?.images?.[0]?.url || "https://placehold.co/600x400"}
                                  alt={item?.product?.name || ""}
                                />
                              </div>
                              <div className="ml-4 flex-1 text-left">
                                <Link href={`/product/${item.product.id}`}>
                                  <h3 className="font-medium hover:text-glacier-600">{item.product.name}</h3>
                                </Link>
                                <p className="text-sm text-gray-500 mt-1">{item.product.category?.name}</p>
                                <p className="text-sm text-gray-500 mt-1">${item.product.price.toFixed(2)}</p>
                              </div>
                            </div>
                          </CardTitle>
                        </CardHeader>
                        <CardFooter>
                          <div className="flex justify-end items-center w-full space-x-2 gap-2">
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" onClick={() => handleRemoveFromWishlist(item.id)}>
                              <Trash className="h-4 w-4" />
                              Remove
                            </Button>
                            <Button asChild size="sm" className="bg-glacier-600 hover:bg-glacier-700">
                              <Link href={`/product/${item.product.id}`}>View Product</Link>
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Notifications Tab */}
          {tab === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Manage how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Email Notifications</h3>
                      <p className="text-sm text-gray-500">Receive order updates and promotional emails</p>
                    </div>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                      <input
                        type="checkbox"
                        id="email-notifications"
                        checked={emailNotifications}
                        onChange={() => setEmailNotifications(!emailNotifications)}
                        className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                      />
                      <label
                        htmlFor="email-notifications"
                        className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${emailNotifications ? "bg-glacier-600" : "bg-gray-300"
                          }`}
                      ></label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Order Updates</h3>
                      <p className="text-sm text-gray-500">Receive notifications about your orders</p>
                    </div>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                      <input
                        type="checkbox"
                        id="order-updates"
                        checked={orderUpdates}
                        onChange={() => setOrderUpdates(!orderUpdates)}
                        className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                      />
                      <label
                        htmlFor="order-updates"
                        className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${orderUpdates ? "bg-glacier-600" : "bg-gray-300"
                          }`}
                      ></label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Promotional Emails</h3>
                      <p className="text-sm text-gray-500">Receive emails about sales and special offers</p>
                    </div>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                      <input
                        type="checkbox"
                        id="promotional-emails"
                        checked={promotionalEmails}
                        onChange={() => setPromotionalEmails(!promotionalEmails)}
                        className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                      />
                      <label
                        htmlFor="promotional-emails"
                        className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${promotionalEmails ? "bg-glacier-600" : "bg-gray-300"
                          }`}
                      ></label>
                    </div>
                  </div>
                </div>

                <Button
                  // onClick={handleUpdateNotifications}
                  className="bg-glacier-600 hover:bg-glacier-700"
                  disabled
                >
                  {savingNotifications ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Preferences"
                  )}
                </Button>

                <div className="pt-4">
                  <CommingSoon title="Notification Preferences" description="This feature is currently under development and will be available soon." />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security Tab */}
          {tab === "security" && (
            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>Manage your password and account security</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="bg-glacier-600 hover:bg-glacier-700" disabled={changingPassword}>
                    {changingPassword ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </Button>
                </form>

                <div className="mt-8 pt-4 border-t">
                  <h3 className="text-lg font-medium mb-4">Two-Factor Authentication</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Add an extra layer of security to your account by enabling two-factor authentication.
                  </p>
                  <Button className="bg-glacier-600 hover:bg-glacier-700" disabled>Enable 2FA</Button>

                  <div className="pt-4">
                    <CommingSoon title="Two-Factor Authentication" description="This feature is currently under development and will be available soon." />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Settings Tab */}
          {tab === "settings" && (
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <select id="language" className="w-full p-2 border rounded-md" defaultValue="en">
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <select id="currency" className="w-full p-2 border rounded-md" defaultValue="usd">
                      <option value="usd">USD ($)</option>
                      <option value="eur">EUR (€)</option>
                      <option value="gbp">GBP (£)</option>
                      <option value="cad">CAD ($)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4">
                  <Button className="bg-glacier-600 hover:bg-glacier-700" disabled>Save Settings</Button>
                </div>

                <div className="pt-6 border-t mt-6">
                  <h3 className="text-lg font-medium text-red-600 mb-2">Danger Zone</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <Button variant="destructive" disabled>Delete Account</Button>
                </div>

                <div className="pt-4">
                  <CommingSoon title="Account Settings" description="This feature is currently under development and will be available soon." />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

