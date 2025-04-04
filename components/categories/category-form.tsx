"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowser } from "@/lib/supabase"
import type { Category } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Upload } from "lucide-react"
import { v4 as uuidv4 } from "uuid"

interface CategoryFormProps {
  initialData?: Category
  onReload?: any
}

export default function CategoryForm({ initialData, onReload }: CategoryFormProps) {
  const [category, setCategory] = useState<Partial<Category>>({
    name: "",
    slug: "",
    description: "",
    parent_id: "",
    image_url: "",
    ...initialData,
  })

  const [categories, setCategories] = useState<Category[]>([])
  const [uploading, setUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = getSupabaseBrowser()
  const isEditing = !!initialData

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from("categories").select("*").order("name")

      if (error) throw error

      // Filter out the current category (if editing) to prevent self-reference
      const filteredCategories = isEditing ? data?.filter((c) => c.id !== initialData?.id) || [] : data || []

      setCategories(filteredCategories)
    } catch (error: any) {
      console.error("Error fetching categories:", error.message)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load categories",
      })
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    // If name field is being updated, also update the slug
    if (name === "name") {
      setCategory({
        ...category,
        name: value,
        slug: value
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, ""),
      })
    } else {
      setCategory({ ...category, [name]: value })
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setCategory({ ...category, [name]: value })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    setUploading(true)

    try {
      const file = e.target.files[0]
      const fileExt = file.name.split(".").pop()
      const fileName = `${uuidv4()}.${fileExt}`
      const filePath = `categories/${fileName}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage.from("products").upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: publicUrlData } = supabase.storage.from("products").getPublicUrl(filePath)

      // Update category state
      setCategory({
        ...category,
        image_url: publicUrlData.publicUrl,
      })

      toast({
        title: "Image uploaded",
        description: "Image has been uploaded successfully",
      })
    } catch (error: any) {
      console.error("Error uploading image:", error.message)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload image",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!category.name || !category.slug) {
        throw new Error("Name and slug are required")
      }

      if (isEditing) {
        // Update existing category
        const { error } = await supabase
          .from("categories")
          .update({
            name: category.name,
            slug: category.slug,
            description: category.description,
            parent_id: category.parent_id || null,
            image_url: category.image_url,
            updated_at: new Date().toISOString(),
          })
          .eq("id", initialData.id)

        if (error) throw error
      } else {
        // Create new category
        const { error } = await supabase.from("categories").insert({
          name: category.name,
          slug: category.slug,
          description: category.description,
          parent_id: category.parent_id || null,
          image_url: category.image_url,
        })

        if (error) throw error
      }

      toast({
        title: isEditing ? "Category updated" : "Category created",
        description: isEditing ? "Category has been updated successfully" : "Category has been created successfully",
      })

      router.push("/admin/categories")
      onReload()
    } catch (error: any) {
      console.error("Error saving category:", error.message)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save category",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{isEditing ? "Edit Category" : "New Category"}</h1>
            <p className="text-muted-foreground">
              {isEditing ? "Update category information" : "Add a new category to your store"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button type="submit" className="bg-glacier-600 hover:bg-glacier-700" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Update Category" : "Create Category"}
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Category Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" value={category.name} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" name="slug" value={category.slug} onChange={handleChange} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={category.description || ""}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parent_id">Parent Category</Label>
              <Select
                value={category.parent_id || ""}
                onValueChange={(value) => handleSelectChange("parent_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="None (Top Level)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Top Level)</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Category Image</Label>
              <div className="flex items-center gap-4">
                {category.image_url && (
                  <div className="relative h-24 w-24 overflow-hidden rounded-md border">
                    <img
                      src={category.image_url || "/placeholder.svg"}
                      alt={category.name || "Category image"}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed">
                  <div className="flex flex-col items-center justify-center gap-1 p-2 text-center">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Upload</span>
                  </div>
                  <Input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </label>
                {uploading && (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin text-glacier-600 mr-2" />
                    <span className="text-sm">Uploading...</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  )
}

