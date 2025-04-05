import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
    return (
        <section className="relative bg-gradient-to-r from-glacier-900 to-glacier-700 text-white">
          <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl font-bold leading-tight">Discover Quality Products for Every Need</h1>
                <p className="text-lg md:text-xl opacity-90">
                  Shop the latest trends with confidence. Free shipping on orders over $50.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button size="lg" asChild className="bg-white text-glacier-800 hover:bg-glacier-100">
                    <Link href="/products">Shop Now</Link>
                  </Button>
                  <Button size="lg" variant="outline" className="border-white text-glacier-800 bg-white hover:bg-glacier-100">
                    <Link href="/categories">Browse Categories</Link>
                  </Button>
                </div>
              </div>
              <div className="hidden md:block relative h-[400px]">
                <Image
                  src="/placeholder.svg?height=400&width=600"
                  alt="Featured Products"
                  fill
                  className="object-cover rounded-lg"
                  priority
                />
              </div>
            </div>
          </div>
        </section>
    )
}
