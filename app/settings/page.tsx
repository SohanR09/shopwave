"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { getSupabaseBrowser } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Bell, CreditCard, Globe, Loader2, MapPin, Shield } from "lucide-react"
import { getSession } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

interface Address {
  id: string
  user_id: string
  type: string
  first_name: string
  last_name: string
  company?: string
  address_line1: string
  address_line2?: string
  city: string
  state: string
  postal_code: string
  country: string
  phone?: string
  is_default: boolean
}

export default function SettingsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tab = searchParams.get("tab") || "addresses"
  const supabase = getSupabaseBrowser()

  const [addresses, setAddresses] = useState<Address[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // New address form state
  const [addressType, setAddressType] = useState("shipping")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [company, setCompany] = useState("")
  const [addressLine1, setAddressLine1] = useState("")
  const [addressLine2, setAddressLine2] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [country, setCountry] = useState("")
  const [phone, setPhone] = useState("")
  const [isDefault, setIsDefault] = useState(false)
  
  const [session, setSession] = useState<any | null>(null)
  const [user, setUser] = useState<any | null>(null)
  const [status, setStatus] = useState<any | null>(null)

    // Payment methods state
    const [paymentMethods, setPaymentMethods] = useState<any[]>([])
    const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false)
  
    // Notification settings
    const [emailNotifications, setEmailNotifications] = useState(true)
    const [orderUpdates, setOrderUpdates] = useState(true)
    const [promotionalEmails, setPromotionalEmails] = useState(true)
    const [savingNotifications, setSavingNotifications] = useState(false)
  
    // Privacy settings
    const [savePaymentInfo, setSavePaymentInfo] = useState(true)
    const [shareUsageData, setShareUsageData] = useState(true)
    const [savingPrivacy, setSavingPrivacy] = useState(false)

  useEffect(() => {
    const fetchSession = async () => {
      const { session, user, error } = await getSession()
      if (error) {
        console.error("Error fetching session:", error)
      }else{
        setSession(session)
        setUser(user)
        setStatus(session?.user?.id ? "authenticated" : "unauthenticated")
      }
    }
    fetchSession()
  }, [] )

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin?callbackUrl=/settings")
    }

    if (status === "authenticated" && session.user) {
      fetchAddresses()
      fetchPaymentMethods()
    }
  }, [status, session])

  const fetchAddresses = async () => {
    if (!session?.user?.id) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", session.user.id)
        .order("is_default", { ascending: false })

      if (error) throw error
      setAddresses(data as any || [])
    } catch (error: any) {
      console.error("Error fetching addresses:", error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPaymentMethods = async () => {
    if (!session?.user?.id) return

    setLoadingPaymentMethods(true)
    try {
      // In a real app, you would fetch payment methods from your payment processor
      // This is a placeholder for demonstration
      setPaymentMethods([])
    } catch (error: any) {
      console.error("Error fetching payment methods:", error.message)
    } finally {
      setLoadingPaymentMethods(false)
    }
  }

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user?.id) return

    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      // If this is set as default, update all other addresses of this type to not be default
      if (isDefault) {
        await supabase
          .from("addresses")
          .update({ is_default: false })
          .eq("user_id", session.user.id)
          .eq("type", addressType)
      }

      // Add new address
      const { error } = await supabase.from("addresses").insert({
        user_id: session.user.id,
        type: addressType,
        first_name: firstName,
        last_name: lastName,
        company,
        address_line1: addressLine1,
        address_line2: addressLine2,
        city,
        state,
        postal_code: postalCode,
        country,
        phone,
        is_default: isDefault,
      })

      if (error) throw error

      setSuccess("Address added successfully")

      // Reset form
      setAddressType("shipping")
      setFirstName("")
      setLastName("")
      setCompany("")
      setAddressLine1("")
      setAddressLine2("")
      setCity("")
      setState("")
      setPostalCode("")
      setCountry("")
      setPhone("")
      setIsDefault(false)

      // Refresh addresses
      fetchAddresses()
    } catch (error: any) {
      setError(error.message || "Error adding address")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteAddress = async (addressId: string) => {
    if (!session?.user?.id) return

    try {
      const { error } = await supabase.from("addresses").delete().eq("id", addressId).eq("user_id", session.user.id)

      if (error) throw error

      // Update local state
      setAddresses((prev) => prev.filter((addr) => addr.id !== addressId))
      setSuccess("Address deleted successfully")
    } catch (error: any) {
      setError(error.message || "Error deleting address")
    }
  }

  const handleSetDefaultAddress = async (addressId: string, type: string) => {
    if (!session?.user?.id) return

    try {
      // Set all addresses of this type to not default
      await supabase.from("addresses").update({ is_default: false }).eq("user_id", session.user.id).eq("type", type)

      // Set the selected address as default
      const { error } = await supabase
        .from("addresses")
        .update({ is_default: true })
        .eq("id", addressId)
        .eq("user_id", session.user.id)

      if (error) throw error

      // Update local state
      setAddresses((prev) =>
        prev.map((addr) => ({
          ...addr,
          is_default: addr.id === addressId && addr.type === type,
        })),
      )

      setSuccess("Default address updated")
    } catch (error: any) {
      setError(error.message || "Error updating default address")
    }
  }

  const handleUpdateNotifications = async () => {
    if (!session?.user?.id) return

    setSavingNotifications(true)
    setError(null)
    setSuccess(null)

    try {
      const notificationPreferences = {
        email_notifications: emailNotifications,
        order_updates: orderUpdates,
        promotional_emails: promotionalEmails,
      }

      const { error } = await supabase
        .from("users")
        .update({
          notification_preferences: notificationPreferences,
          updated_at: new Date().toISOString(),
        })
        .eq("id", session.user.id)

      if (error) throw error

      setSuccess("Notification preferences updated successfully")
    } catch (error: any) {
      setError("Error updating notification preferences")
    } finally {
      setSavingNotifications(false)
      setTimeout(() => {
        setError("")
      }, 3000)
    }
  }

  const handleUpdatePrivacy = async () => {
    if (!session?.user?.id) return

    setSavingPrivacy(true)
    setError(null)
    setSuccess(null)

    try {
      const privacySettings = {
        save_payment_info: savePaymentInfo,
        share_usage_data: shareUsageData,
      }

      const { error } = await supabase
        .from("users")
        .update({
          privacy_settings: privacySettings,
          updated_at: new Date().toISOString(),
        })
        .eq("id", session.user.id)

      if (error) throw error

      setSuccess("Privacy settings updated successfully")
    } catch (error: any) {
      setError( "Error updating privacy settings")
    } finally {
      setSavingPrivacy(false)
      setTimeout(() => {
        setError("")
      }, 3000)
    }
  }

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-glacier-600" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      {/* Sidebar */}
      <div className="md:col-span-1">
        <Card>
          <CardContent className="p-4">
            <nav className="space-y-1 pt-4">
              <Link
                href="/settings?tab=addresses"
                className={`flex items-center px-3 py-2 text-sm rounded-md w-full ${
                  tab === "addresses"
                    ? "bg-glacier-50 text-glacier-700 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <MapPin className="mr-3 h-4 w-4" />
                Addresses
              </Link>
              <Link
                href="/settings?tab=payment"
                className={`flex items-center px-3 py-2 text-sm rounded-md w-full ${
                  tab === "payment" ? "bg-glacier-50 text-glacier-700 font-medium" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <CreditCard className="mr-3 h-4 w-4" />
                Payment Methods
              </Link>
              <Link
                href="/settings?tab=notifications"
                className={`flex items-center px-3 py-2 text-sm rounded-md w-full ${
                  tab === "notifications"
                    ? "bg-glacier-50 text-glacier-700 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Bell className="mr-3 h-4 w-4" />
                Notifications
              </Link>
              <Link
                href="/settings?tab=preferences"
                className={`flex items-center px-3 py-2 text-sm rounded-md w-full ${
                  tab === "preferences"
                    ? "bg-glacier-50 text-glacier-700 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Globe className="mr-3 h-4 w-4" />
                Preferences
              </Link>
              <Link
                href="/settings?tab=privacy"
                className={`flex items-center px-3 py-2 text-sm rounded-md w-full ${
                  tab === "privacy" ? "bg-glacier-50 text-glacier-700 font-medium" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Shield className="mr-3 h-4 w-4" />
                Privacy
              </Link>
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

        {/* Addresses Tab */}
        {tab === "addresses" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Addresses</CardTitle>
                <CardDescription>Manage your shipping and billing addresses</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-glacier-600" />
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-gray-500">You don't have any saved addresses yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((address) => (
                      <Card key={address.id} className="overflow-hidden">
                        <CardHeader className="bg-gray-50 py-3">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <CardTitle className="text-base capitalize">{address.type} Address</CardTitle>
                              {address.is_default && (
                                <span className="ml-2 text-xs bg-glacier-100 text-glacier-800 px-2 py-0.5 rounded-full">
                                  Default
                                </span>
                              )}
                            </div>
                            <div className="flex gap-2">
                              {!address.is_default && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSetDefaultAddress(address.id, address.type)}
                                >
                                  Set as Default
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDeleteAddress(address.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="py-4">
                          <div className="space-y-1">
                            <p className="font-medium">
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Add New Address</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddAddress} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="address-type">Address Type</Label>
                      <select
                        id="address-type"
                        className="w-full p-2 border rounded-md"
                        value={addressType}
                        onChange={(e) => setAddressType(e.target.value)}
                        required
                      >
                        <option value="shipping">Shipping</option>
                        <option value="billing">Billing</option>
                      </select>
                    </div>
                    <div className="flex items-center space-x-2 h-full pt-8">
                      <Switch id="is-default" checked={isDefault} onCheckedChange={setIsDefault} />
                      <Label htmlFor="is-default">Set as default {addressType} address</Label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first-name">First Name</Label>
                      <Input
                        id="first-name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last-name">Last Name</Label>
                      <Input id="last-name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Company (Optional)</Label>
                    <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address-line1">Address Line 1</Label>
                    <Input
                      id="address-line1"
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address-line2">Address Line 2 (Optional)</Label>
                    <Input
                      id="address-line2"
                      value={addressLine2}
                      onChange={(e) => setAddressLine2(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State/Province</Label>
                      <Input id="state" value={state} onChange={(e) => setState(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postal-code">Postal Code</Label>
                      <Input
                        id="postal-code"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone (Optional)</Label>
                      <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                  </div>

                  <Button type="submit" className="bg-glacier-600 hover:bg-glacier-700" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add Address"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Payment Methods Tab */}
        {tab === "payment" && (
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Manage your saved payment methods</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingPaymentMethods ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-glacier-600" />
                </div>
              ) : paymentMethods.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-500">You don't have any saved payment methods yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <Card key={method.id} className="overflow-hidden">
                      <div className="p-4 flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center mr-4">
                            {method.card.brand === "visa" ? (
                              <span className="text-blue-600 font-bold">VISA</span>
                            ) : method.card.brand === "mastercard" ? (
                              <span className="text-red-600 font-bold">MC</span>
                            ) : (
                              <CreditCard className="h-5 w-5" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">
                              {method.card.brand.charAt(0).toUpperCase() + method.card.brand.slice(1)} ending in{" "}
                              {method.card.last4}
                            </p>
                            <p className="text-sm text-gray-500">
                              Expires {method.card.exp_month}/{method.card.exp_year}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {method.is_default && (
                            <span className="mr-4 text-xs bg-glacier-100 text-glacier-800 px-2 py-0.5 rounded-full">
                              Default
                            </span>
                          )}
                          <Button variant="outline" size="sm" className="mr-2">
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              <div className="mt-6">
                <Button className="bg-glacier-600 hover:bg-glacier-700" disabled>Add Payment Method</Button>
              </div>
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
                  <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Order Updates</h3>
                    <p className="text-sm text-gray-500">Receive notifications about your orders</p>
                  </div>
                  <Switch checked={orderUpdates} onCheckedChange={setOrderUpdates} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Promotional Emails</h3>
                    <p className="text-sm text-gray-500">Receive emails about sales and special offers</p>
                  </div>
                  <Switch checked={promotionalEmails} onCheckedChange={setPromotionalEmails} />
                </div>
              </div>

              <Button
                onClick={handleUpdateNotifications}
                className="bg-glacier-600 hover:bg-glacier-700"
                disabled={savingNotifications}
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
            </CardContent>
          </Card>
        )}

        {/* Preferences Tab */}
        {tab === "preferences" && (
          <Card>
            <CardHeader>
              <CardTitle>Account Preferences</CardTitle>
              <CardDescription>Manage your account settings and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
              <Button className="bg-glacier-600 hover:bg-glacier-700" disabled>Save Preferences</Button>
            </CardContent>
          </Card>
        )}

        {/* Privacy Tab */}
        {tab === "privacy" && (
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Manage your privacy and data sharing preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Save Payment Information</h3>
                    <p className="text-sm text-gray-500">Securely save payment methods for faster checkout</p>
                  </div>
                  <Switch checked={savePaymentInfo} onCheckedChange={setSavePaymentInfo} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Share Usage Data</h3>
                    <p className="text-sm text-gray-500">Help us improve by sharing anonymous usage data</p>
                  </div>
                  <Switch checked={shareUsageData} onCheckedChange={setShareUsageData} />
                </div>
              </div>

              <Button
                onClick={handleUpdatePrivacy}
                className="bg-glacier-600 hover:bg-glacier-700"
                disabled={savingPrivacy}
              >
                {savingPrivacy ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Privacy Settings"
                )}
              </Button>

              <Separator className="my-4" />

              <div>
                <h3 className="font-medium mb-2">Data & Privacy</h3>
                <p className="text-sm text-gray-500 mb-4">
                  You can request a copy of your data or delete your account and all associated data.
                </p>
                <div className="flex space-x-4">
                  <Button variant="outline" disabled>Request Data Export</Button>
                  <Button variant="destructive" disabled>Delete Account</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  </div>
  )
}

