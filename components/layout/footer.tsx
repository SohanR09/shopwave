"use client"

import Link from "next/link"
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { usePathname } from "next/navigation"

export default function Footer() {
  const pathname = usePathname()

  if (pathname === "/signin" || pathname === "/signup" || pathname === "/admin") {
    return null
  }

  return (
    <footer className="bg-glacier-950 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-bold mb-4">ShopWave</h3>
            <p className="text-glacier-100 mb-4">
              Your one-stop destination for quality products at affordable prices.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-glacier-100 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-glacier-100 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-glacier-100 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-glacier-100 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-glacier-100 hover:text-white transition-colors">
                  Shop
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-glacier-100 hover:text-white transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/sale" className="text-glacier-100 hover:text-white transition-colors">
                  Sale
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-glacier-100 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-glacier-100 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-bold mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/faq" className="text-glacier-100 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-glacier-100 hover:text-white transition-colors">
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-glacier-100 hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-glacier-100 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-bold mb-4">Newsletter</h3>
            <p className="text-glacier-100 mb-4">Subscribe to our newsletter for the latest updates and offers.</p>
            <form className="space-y-2">
              <Input
                type="email"
                placeholder="Your email address"
                className="bg-glacier-800 border-glacier-700 text-white placeholder:text-glacier-400"
              />
              <Button className="w-full bg-glacier-600 hover:bg-glacier-500">Subscribe</Button>
            </form>
          </div>
        </div>

        <div className="border-t border-glacier-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-glacier-100">&copy; {new Date().getFullYear()} ShopWave. All rights reserved.</p>
            </div>
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-6">
              <div className="flex items-center text-glacier-100">
                <Phone className="h-4 w-4 mr-2" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center text-glacier-100">
                <Mail className="h-4 w-4 mr-2" />
                <span>support@shopwave.com</span>
              </div>
              <div className="flex items-center text-glacier-100">
                <MapPin className="h-4 w-4 mr-2" />
                <span>123 Commerce St, City, Country</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

