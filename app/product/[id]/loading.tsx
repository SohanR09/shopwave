import { Skeleton } from "@/components/ui/skeleton"

export default function ProductLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image Skeleton */}
        <Skeleton className="aspect-square rounded-lg" />

        {/* Product Details Skeleton */}
        <div className="flex flex-col space-y-6">
          <div>
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-4 w-1/3 mt-2" />
          </div>

          <Skeleton className="h-8 w-1/4" />

          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>

          <div className="flex space-x-4">
            <Skeleton className="h-12 w-40" />
            <Skeleton className="h-12 w-40" />
          </div>

          <div className="mt-8">
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="h-px w-full bg-gray-200 my-4" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16 mt-1" />
              </div>
              <div>
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16 mt-1" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Skeleton */}
      <div className="mt-16">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

