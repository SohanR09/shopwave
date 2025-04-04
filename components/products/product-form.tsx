"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { getSupabaseBrowser } from "@/lib/supabase"
import type { Product, Category, ProductImage } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Trash, Upload } from "lucide-react"
import { v4 as uuidv4 } from "uuid"

interface ProductFormProps {
  initialData?: Product
  onReload?: any
  setError?: any
}

export default function ProductForm({ initialData,onReload, setError }: ProductFormProps) {
  const [product, setProduct] = useState<Partial<Product>>({
    name: "",
    slug: "",
    description: "",
    price: 0,
    compare_at_price: 0,
    cost_price: 0,
    sku: "",
    barcode: "",
    inventory_quantity: 0,
    category_id: "",
    brand: "",
    is_active: true,
    is_featured: false,
    ...initialData,
  })

  const [categories, setCategories] = useState<Category[]>([])
  const [images, setImages] = useState<ProductImage[]>(initialData?.images || [])
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
      setCategories(data as any || [])
    } catch (error: any) {
      setError(error.message)
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
      setProduct({
        ...product,
        name: value,
        slug: value
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, ""),
      })
    } else {
      setProduct({ ...product, [name]: value })
    }
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProduct({ ...product, [name]: Number.parseFloat(value) || 0 })
  }

  const handleSelectChange = (name: string, value: string) => {
    setProduct({ ...product, [name]: value })
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setProduct({ ...product, [name]: checked })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    setUploading(true)

    try {
      const file = e.target.files[0]
      const fileExt = file.name.split(".").pop()
      const fileName = `${uuidv4()}.${fileExt}`
      const filePath = `${initialData?.id || "new"}/${fileName}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage.from("products").upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: publicUrlData } = supabase.storage.from("products").getPublicUrl(filePath)

      // Add to images array
      const newImage = {
        id: uuidv4(),
        product_id: initialData?.id || "",
        url: publicUrlData.publicUrl,
        alt_text: product.name || "Product image",
        position: images.length,
      }

      setImages([...images, newImage])

      toast({
        title: "Image uploaded",
        description: "Image has been uploaded successfully",
      })
    } catch (error: any) {
      setError(error.message)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload image",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleImageDelete = async (imageId: string, imageUrl: string) => {
    try {
      // Extract file path from URL
      const filePath = imageUrl.split("/").pop()

      if (isEditing && imageId) {
        // Delete from database
        const { error } = await supabase.from("product_images").delete().eq("id", imageId)

        if (error) throw error
      }

      // Delete from storage
      if (filePath) {
        const { error: storageError } = await supabase.storage
          .from("products")
          .remove([`${initialData?.id || "new"}/${filePath}`])

        if (storageError) throw storageError
      }

      // Update local state
      setImages(images.filter((img) => img.id !== imageId))

      toast({
        title: "Image deleted",
        description: "Image has been deleted successfully",
      })
    } catch (error: any) {
      setError(error.message)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete image",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      debugger
      if (!product.name || !product.price) {
        setError("Name and price are required")
        return
      }
      if(product.name.length < 3){
        setError("Name must be at least 3 characters")
        return
      }
      if(product?.slug && product?.slug.length < 2){
        setError("Slug must be at least 2 characters")
        return
      }
      if(product.brand === ""){
        setError("Brand is required")
        return
      }
      if(product.category_id === "none"){
        setError("Category is required")
        return
      }
      if(product?.inventory_quantity && product?.inventory_quantity < 0){
        setError("Inventory quantity cannot be negative")
        return
      }
      if(product?.price && product?.price < 0){
        setError("Price cannot be negative")
        return
      }
      if(product?.compare_at_price && product?.compare_at_price < 0){
        setError("Compare at price cannot be negative")
        return
      }
      if(product?.cost_price && product?.cost_price < 0){
        setError("Cost price cannot be negative")
        return
      }
      if(product?.sku && product?.sku.length < 3){
        setError("SKU must be at least 3 characters")
        return
      }
      if(product?.barcode && product?.barcode.length < 3){
        setError("Barcode must be at least 3 characters")
        return
      }

      let productId = initialData?.id

      if (isEditing) {
        // Update existing product
        const { error } = await supabase
          .from("products")
          .update({
            name: product.name,
            slug: product.slug,
            description: product.description,
            price: product.price,
            compare_at_price: product.compare_at_price,
            cost_price: product.cost_price,
            sku: product.sku,
            barcode: product.barcode,
            inventory_quantity: product.inventory_quantity,
            category_id: product.category_id,
            brand: product.brand,
            is_active: product.is_active,
            is_featured: product.is_featured,
            updated_at: new Date().toISOString(),
          })
          .eq("id", productId as string)

        if (error) {
          setError(error.message)
          return
        }
      } else {
        // Create new product
        const { data, error } = await supabase
          .from("products")
          .insert({
            name: product.name,
            slug: product.slug,
            description: product.description,
            price: product.price,
            compare_at_price: product.compare_at_price,
            cost_price: product.cost_price,
            sku: product.sku,
            barcode: product.barcode,
            inventory_quantity: product.inventory_quantity,
            category_id: product.category_id,
            brand: product.brand,
            is_active: product.is_active,
            is_featured: product.is_featured,
          })
          .select()
          .single()

        if (error) {
          setError(error.message)
          return
        }
        productId = data.id as string
      }

      // Handle images
      if (!isEditing && images.length > 0) {
        // For new products, we need to update the product_id in the images
        const imagesToInsert = images.map((img) => ({
          ...img,
          product_id: productId,
        }))

        const { error: imagesError } = await supabase.from("product_images").insert(imagesToInsert)

        if (imagesError) {
          setError(imagesError.message)
          return
        }
      }
      toast({
        title: isEditing ? "Product updated" : "Product created",
        description: isEditing ? "Product has been updated successfully" : "Product has been created successfully",
      })

      router.push("/admin/products")
      onReload()
      setTimeout(() => {
        setError("")
        setProduct({
          name: "",
          slug: "",
          description: "",
          price: 0,
          compare_at_price: 0,
          cost_price: 0,
          sku: "",
          barcode: "",
          inventory_quantity: 0,
          category_id: "",
          brand: "",
          is_active: true,
          is_featured: false,
          images: [],
          created_at: "",
          updated_at: "",
        })
      }, 1000)
    } catch (error: any) {
      setError(error.message)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save product",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  const pathname = usePathname()
  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{isEditing ? "Edit Product" : "New Product"}</h1>
            <p className="text-muted-foreground">
              {isEditing ? "Update product information" : "Add a new product to your store"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" className={pathname === "/admin/products" ?  "hidden" : ""} onClick={() => router.push("/admin/products")}>
              Cancel
            </Button>
            <Button type="submit" className="bg-glacier-600 hover:bg-glacier-700" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Update Product" : "Create Product"}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="general">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>General Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" value={product.name} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug</Label>
                    <Input id="slug" name="slug" value={product.slug} onChange={handleChange} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={product.description || ""}
                    onChange={handleChange}
                    rows={5}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      value={product.price}
                      onChange={handleNumberChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="compare_at_price">Compare at Price</Label>
                    <Input
                      id="compare_at_price"
                      name="compare_at_price"
                      type="number"
                      step="0.01"
                      value={product.compare_at_price || ""}
                      onChange={handleNumberChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cost_price">Cost Price</Label>
                    <Input
                      id="cost_price"
                      name="cost_price"
                      type="number"
                      step="0.01"
                      value={product.cost_price || ""}
                      onChange={handleNumberChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="category_id">Category</Label>
                    <Select
                      value={product.category_id || ""}
                      onValueChange={(value) => handleSelectChange("category_id", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand</Label>
                    <Input id="brand" name="brand" value={product.brand || ""} onChange={handleChange} />
                  </div>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={product.is_active}
                      onCheckedChange={(checked) => handleSwitchChange("is_active", checked)}
                    />
                    <Label htmlFor="is_active">Active</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_featured"
                      checked={product.is_featured}
                      onCheckedChange={(checked) => handleSwitchChange("is_featured", checked)}
                    />
                    <Label htmlFor="is_featured">Featured</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="images" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                    {images.map((image) => (
                      <div key={image.id} className="relative aspect-square rounded-md overflow-hidden border">
                        <img
                          src={image.url || "/placeholder.svg"}
                          alt={image.alt_text || "Product image"}
                          className="h-full w-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute right-2 top-2"
                          onClick={() => handleImageDelete(image.id, image.url)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-md border border-dashed">
                      <div className="flex flex-col items-center justify-center gap-1 p-4 text-center">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <span className="text-sm font-medium">Upload Image</span>
                        <span className="text-xs text-muted-foreground">PNG, JPG, WEBP up to 5MB</span>
                      </div>
                      <Input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={uploading}
                      />
                    </label>
                  </div>
                  {uploading && (
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-glacier-600" />
                      <span className="ml-2">Uploading...</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Inventory</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU</Label>
                    <Input id="sku" name="sku" value={product.sku || ""} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="barcode">Barcode</Label>
                    <Input id="barcode" name="barcode" value={product.barcode || ""} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inventory_quantity">Quantity</Label>
                    <Input
                      id="inventory_quantity"
                      name="inventory_quantity"
                      type="number"
                      value={product.inventory_quantity}
                      onChange={handleNumberChange}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </form>
  )
}

