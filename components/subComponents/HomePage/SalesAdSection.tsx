import { Button } from "@/components/ui/button"
import { Product } from "@/types"
import Image from "next/image"
import Link from "next/link"

export default function SalesAdSection({ saleProducts }: { saleProducts: Product[] }) {
    return (
        <section className="py-12 bg-gradient-to-r from-red-500 to-orange-500 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="inline-block px-3 py-1 bg-white text-red-600 font-semibold rounded-full text-sm">
                Limited Time Offer
              </span>
              <h2 className="text-3xl md:text-4xl font-bold">Summer Sale Up to 50% Off</h2>
              <p className="text-lg opacity-90">Grab amazing deals on seasonal items before they're gone!</p>
              <Button size="lg" asChild className="bg-white text-red-600 hover:bg-gray-100">
                <Link href="/sale">Shop the Sale</Link>
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {saleProducts?.slice(0, 4).map((product) => (
                <Link key={product.id} href={`/product/${product.id}`} className="block">
                  <div className="bg-white/10 p-2 rounded-lg hover:bg-white/20 transition-colors">
                    <div className="aspect-square relative rounded overflow-hidden mb-2">
                      {product.images && product.images[0] ? (
                        <Image
                          src={product.images[0].url || "/placeholder.svg"}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-white/20 flex items-center justify-center">
                          <span className="text-white/70">No image</span>
                        </div>
                      )}
                    </div>
                    <h3 className="font-medium text-sm line-clamp-1">{product.name}</h3>
                    <div className="flex items-center mt-1">
                      <span className="font-bold">${product.price.toFixed(2)}</span>
                      {product.cost_price && (
                        <span className="ml-2 text-xs line-through opacity-70">
                          ${product.cost_price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
}
