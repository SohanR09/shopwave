import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Category } from "@/types";

export default function CategorySection({ categories }: { categories: Category[] }) {
    return (
        <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">Shop by Category</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories?.map((category) => (
              <Link key={category.id} href={`/category/${category.slug}`}>
                <Card className="overflow-hidden h-full transition-all hover:shadow-md">
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
                    <h3 className="text-xl font-semibold">{category.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {category.description || `Browse our collection of ${category.name}`}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    )
}
