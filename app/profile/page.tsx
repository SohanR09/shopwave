"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowser } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2, Upload } from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import { getSession } from "@/lib/utils"

export default function ProfilePage() {
  const router = useRouter()
  const supabase = getSupabaseBrowser()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [session, setSession] = useState<any | null>(null)
  const [user, setUser] = useState<any | null>(null)
  const [status, setStatus] = useState<any | null>(null)

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
  }, [])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin?callbackUrl=/profile")
    }
    if (status === "authenticated" && session.user) {
      fetchUserProfile()
    }
  }, [status, session])

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
      const { data: signedUrlData } = await supabase.storage.from("profiles").createSignedUrl(filePath, 43800)

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

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-glacier-600" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      <Tabs defaultValue="profile" className="max-w-3xl mx-auto">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Profile Information</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information and profile picture</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert className="bg-green-50 text-green-800 border-green-200">
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback>{name.charAt(0)}</AvatarFallback>
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

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={email} disabled className="bg-gray-50" />
                  <p className="text-xs text-gray-500">Email cannot be changed. Contact support for assistance.</p>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Manage your password and account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" />
              </div>
              <Button className="bg-glacier-600 hover:bg-glacier-700">Update Password</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

