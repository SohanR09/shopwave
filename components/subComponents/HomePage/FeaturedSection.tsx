import { ArrowRight } from "lucide-react";
import Link from "next/link";
import ProductCard from "../../products/product-card";

interface FeaturedSectionProps {
    featuredProducts: any[]
}

export default function FeaturedSection({ featuredProducts}: FeaturedSectionProps) {
    return (
        <section className="py-12 bg-white">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold">Featured Products</h2>
                    <Link href="/products?featured=true" className="text-glacier-600 hover:text-glacier-700 flex items-center">
                        View All <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {featuredProducts?.map((product: any) => (
                <ProductCard key={product.id} product={product} />
                ))}
                {!featuredProducts?.length && (
                <p className="col-span-full text-center py-8 text-muted-foreground">
                    No featured products available at the moment.
                </p>
                )}
            </div>
        </div>
      </section>
    )
}
