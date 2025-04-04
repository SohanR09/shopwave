import { Skeleton } from "@/components/ui/skeleton"

export default function HomeLoading() {
  return (
    <div>
      {/* Hero Section Skeleton */}
      <section className="bg-gradient-to-r from-glacier-900 to-glacier-700">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <Skeleton className="h-12 w-full max-w-md bg-white/20" />
              <Skeleton className="h-6 w-full max-w-sm bg-white/20" />
              <div className="flex gap-4">
                <Skeleton className="h-10 w-32 bg-white/20" />
                <Skeleton className="h-10 w-32 bg-white/20" />
              </div>
            </div>
            <Skeleton className="hidden md:block h-[400px] w-full bg-white/20 rounded-lg" />
          </div>
        </div>
      </section>

      {/* Featured Products Skeleton */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-24" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="border rounded-lg overflow-hidden">
                <Skeleton className="aspect-square w-full" />
                <div className="p-4">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-8 w-16 rounded-md" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category Cards Skeleton */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <Skeleton className="h-8 w-48 mb-8" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border rounded-lg overflow-hidden">
                <Skeleton className="aspect-video w-full" />
                <div className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

