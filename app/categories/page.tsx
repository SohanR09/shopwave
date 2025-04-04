import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { getSupabaseServer } from "@/lib/supabase"

export default async function CategoriesPage() {
  const supabase = getSupabaseServer()

  // Fetch all categories
  const { data: categories, error } = await supabase.from("categories").select("*").order("name")

  if (error) {
    console.error("Error fetching categories:", error)
  }

  // Group categories by parent
  const parentCategories = categories?.filter((cat) => !cat.parent_id) || []
  const childCategories = categories?.filter((cat) => cat.parent_id) || []

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-6">All Categories</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {parentCategories.map((category) => {
          const children = childCategories.filter((child) => child.parent_id === category.id)

          return (
            <Link key={category.id} href={`/category/${category.slug}`}>
              <Card className="overflow-hidden transition-all hover:shadow-md">
                <div className="aspect-video relative">
                  {category.image_url ? (
                    <Image
                      src={category.image_url || "/placeholder.svg"}
                      alt={category.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-glacier-100 flex items-center justify-center">
                      <span className="text-glacier-600 font-medium">{category.name}</span>
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h2 className="text-xl font-semibold mb-2">{category.name}</h2>
                  {children.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {children.map((child) => (
                        <span key={child.id} className="text-sm text-muted-foreground">
                          {child.name}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

