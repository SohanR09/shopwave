"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { getSupabaseBrowser } from "@/lib/supabase"
import type { Category } from "@/types"
import { usePathname } from "next/navigation"

export default function CategoryNav() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const supabase = getSupabaseBrowser()

  const pathname = usePathname();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase.from("categories").select("*").order("name")

        if (error) throw error

        // Filter to only parent categories (no parent_id)
        const parentCategories: any = data?.filter((cat) => !cat.parent_id) || []
        setCategories(parentCategories.slice(0, 6)) // Limit to 6 categories for the nav
      } catch (error) {
        console.error("Error fetching categories:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  if(pathname !== "/" && !pathname.includes("/category/")){
    return null
  }

  return (
    <div className="bg-glacier-50 border-y border-gray-200">
      <div className="container mx-auto px-4">
        <div className="hidden md:flex items-center justify-between h-12">
          <nav className="flex items-center space-x-8">
            {loading ? (
              <div className="flex space-x-8">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-4 w-20 bg-gray-200 animate-pulse rounded"></div>
                ))}
              </div>
            ) : (
              <>
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/category/${category.slug}`}
                    className="text-sm font-medium hover:text-glacier-600 transition-colors"
                  >
                    {category.name}
                  </Link>
                ))}
                <div className="relative group">
                  <button
                    className="flex items-center text-sm font-medium hover:text-glacier-600 transition-colors"
                    onClick={() => setIsOpen(!isOpen)}
                  >
                    More Categories
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </button>
                  <div className="absolute left-0 top-full z-10 mt-1 hidden w-48 rounded-md bg-white p-2 shadow-lg ring-1 ring-black ring-opacity-5 group-hover:block">
                    <Link href="/categories" className="block rounded-md px-3 py-2 text-sm hover:bg-glacier-50">
                      View All Categories
                    </Link>
                  </div>
                </div>
              </>
            )}
          </nav>
          <div className="text-sm font-medium text-glacier-700">
            <Link href="/sale" className="hover:text-glacier-800">
              Special Offers
            </Link>
          </div>
        </div>

        {/* Mobile Categories */}
        <div className="md:hidden py-2 overflow-x-auto whitespace-nowrap">
          {loading ? (
            <div className="flex space-x-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 w-20 bg-gray-200 animate-pulse rounded"></div>
              ))}
            </div>
          ) : (
            <>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className="inline-block mr-4 text-sm font-medium hover:text-glacier-600 transition-colors"
                >
                  {category.name}
                </Link>
              ))}
              <Link
                href="/categories"
                className="inline-block text-sm font-medium hover:text-glacier-600 transition-colors"
              >
                More
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

