"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { getSupabaseBrowser } from "@/lib/supabase"
import { cn, getSession } from "@/lib/utils"
import { Heart, LogOut, Menu, Search, ShoppingCart, User, X } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"

export default function Header() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeaderComponent />
    </Suspense>
  )
}

function HeaderComponent() {
  const supabase = getSupabaseBrowser()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)

  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any | null>({
    name: null,
    email: null,
    avatar_url: null,
  })

  const accessToken = useSearchParams().get("access_token")
  const providerName = useSearchParams().get("provider_name")
  console.log(providerName)
  useEffect(() => {
    const loginWithToken = async () => {
      if (accessToken) {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: providerName || "email",
          token: accessToken,
        })
        if (error) {
          console.error("Error fetching session:", error)
        }
      }      
    }
    loginWithToken()
  }, [accessToken])

  const pathname = usePathname()
  
  useEffect(() => {
    const fetchSession = async () => {
      const { session, user, error } = await getSession()
      if (error) {
        console.error("Error fetching session:", error)
      } else {
        const { data: userData } = await supabase.from("users").select("*").eq("id", user?.id as string).single()

        setIsAuthenticated(!!session)
        userData && setUser({
          name: userData?.name,
          email: userData?.email,
          avatar_url: userData?.avatar_url,
        })
      }
    }
    fetchSession()
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
      setIsSearchOpen(false)
    }
  }

  const handleSignOut = async () => {
    
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error("Error signing out:", error)
    }
    console.log("Signing out")
    localStorage.clear()
    setTimeout(() => {
      window.location.reload()
    }, 500)
  }

  if (pathname === "/signin" || pathname === "/signup" || pathname === "/admin") {
    return null
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-200 shadow-md",
        scrolled ? "bg-white shadow-md" : "bg-white",
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-glacier-600">ShopWave</span>
          </Link>

          {/* Desktop Navigation */}
          {/* <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-sm font-medium hover:text-glacier-600">
              Home
            </Link>
            <Link href="/products" className="text-sm font-medium hover:text-glacier-600">
              All Products
            </Link>
            <Link href="/categories" className="text-sm font-medium hover:text-glacier-600">
              Categories
            </Link>
            <Link href="/sale" className="text-sm font-medium text-red-600 hover:text-red-700">
              Sale
            </Link>
          </nav> */}

          {/* Search Bar (Desktop) */}
          {isSearchOpen && (
            <div className="hidden md:block py-2 px-6 w-full">
              <form onSubmit={handleSearch} className="flex items-center">
                <Input
                  type="search"
                  placeholder="Search for products..."
                  className="flex-1"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                <Button type="submit" className="ml-2 bg-glacier-600 hover:bg-glacier-700">
                  Search
                </Button>
              </form>
            </div>
          )}

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
            <Link href="/wishlist" className="p-2 rounded-full hover:bg-gray-100">
              <Heart className="h-5 w-5" />
            </Link>
            <Link href="/cart" className="p-2 rounded-full hover:bg-gray-100">
              <ShoppingCart className="h-5 w-5" />
            </Link>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="p-2 rounded-full hover:bg-gray-100">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5 flex items-center gap-2">
                    <Avatar>
                      <AvatarImage src={user?.avatar_url} width={100} height={100} />
                      <AvatarFallback>
                        {user?.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <p className="text-sm font-medium">{user?.name || "User"}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  {/* <DropdownMenuItem asChild>
                    <Link href="/orders">My Orders</Link>
                  </DropdownMenuItem> */}
                  <DropdownMenuItem asChild>
                    <Link href="/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <div className="flex items-center gap-2 hover:text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/signin">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-4">
            <Link href="/cart" className="p-2 rounded-full hover:bg-gray-100">
              <ShoppingCart className="h-5 w-5" />
            </Link>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="container mx-auto px-4 py-4">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="flex items-center">
                <Input
                  type="search"
                  placeholder="Search for products..."
                  className="flex-1"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button type="submit" className="ml-2 bg-glacier-600 hover:bg-glacier-700">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </form>
            <nav className="flex flex-col space-y-4">
              <Link
                href="/"
                className="text-sm font-medium py-2 hover:text-glacier-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/products"
                className="text-sm font-medium py-2 hover:text-glacier-600"
                onClick={() => setIsMenuOpen(false)}
              >
                All Products
              </Link>
              <Link
                href="/categories"
                className="text-sm font-medium py-2 hover:text-glacier-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Categories
              </Link>
              <Link
                href="/sale"
                className="text-sm font-medium py-2 text-red-600 hover:text-red-700"
                onClick={() => setIsMenuOpen(false)}
              >
                Sale
              </Link>
              <Link
                href="/wishlist"
                className="text-sm font-medium py-2 hover:text-glacier-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Wishlist
              </Link>
              {status === "authenticated" ? (
                <>
                  <Link
                    href="/profile"
                    className="text-sm font-medium py-2 hover:text-glacier-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/orders"
                    className="text-sm font-medium py-2 hover:text-glacier-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Orders
                  </Link>
                  <Link
                    href="/settings"
                    className="text-sm font-medium py-2 hover:text-glacier-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut()
                      setIsMenuOpen(false)
                    }}
                    className="text-sm font-medium py-2 text-left text-red-600 hover:text-red-700"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <Link
                  href="/signin"
                  className="text-sm font-medium py-2 hover:text-glacier-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}

