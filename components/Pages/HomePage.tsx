"use client"

import { getSupabaseServer } from "@/lib/supabase"
import { Category, Product } from "@/types"
import { Loader2 } from "lucide-react"
import React, { useEffect, useState } from "react"
import CategorySection from "../subComponents/HomePage/CategorySection"
import FeaturedSection from "../subComponents/HomePage/FeaturedSection"
import HeroSection from "../subComponents/HomePage/HerorSection"
import NewsLetterSection from "../subComponents/HomePage/NewsLetterSection"
import SalesAdSection from "../subComponents/HomePage/SalesAdSection"
import CarouselSection from "../subComponents/HomePage/CarouselSection"

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [saleProducts, setSaleProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const supabase = getSupabaseServer()
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      // Fetch featured products
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_featured", true)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(8)

      if (error) {
        setError("Error fetching featured products")
        console.log("Error fetching featured products:", error)
      }
      setFeaturedProducts(data as Product[])
      setLoading(false)
    }
    fetchFeaturedProducts()
  }, [])

  useEffect(() => {
    const fetchCategories = async () => {
      // Fetch categories for category cards
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .is("parent_id", null)
        .order("name")
        .limit(6)

      if (error) {
        setError("Error fetching categories")
        console.log("Error fetching categories:", error)
      }
      setCategories(data as Category[])
      setLoading(false)
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    const fetchSaleProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })

      if (error) {
        setError("Error fetching sale products")
        console.log("Error fetching sale products:", error)
      }
      const salesProducts = data?.filter((product: any) => product.cost_price > product.price).slice(0, 4)
      setSaleProducts(salesProducts as Product[])
      setLoading(false)
    }
    fetchSaleProducts()
  }, [])

  if (loading) {
    return <div className="flex justify-center items-center h-screen">
      <Loader2 className="w-10 h-10 animate-spin" />
    </div>
  }

  return (
    <React.Fragment>
      {/* Carousel Section */}
      {/* <CarouselSection /> */}

      {/* Heror section */}
      <HeroSection />

      {/* Featured Products */}
      <FeaturedSection featuredProducts={featuredProducts} />

      {/* Category Cards */}
      <CategorySection categories={categories} />

      {/* Sales/Ad Section */}
      <SalesAdSection saleProducts={saleProducts} />

      {/* Newsletter Section */}
      <NewsLetterSection />
    </React.Fragment>
  )
}

