import { cn } from "@/lib/utils";

export default function HeaderLoader() {
  return (
    <header className={cn(
        "sticky top-0 z-50 w-full transition-all duration-200 shadow-md", "bg-white",
      )}
    >
        <div className="container mx-auto px-4">
            <div className="flex h-16 items-center justify-between">
                <div className="flex items-center gap-2">
                    {/* Logo Skeleton */}
                    <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
                    
                    {/* Navigation Items Skeleton */}
                    <div className="hidden md:flex items-center gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
                        ))}
                    </div>
                </div>

                {/* Right Side Actions Skeleton */}
                <div className="flex items-center gap-4">
                    <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
                    <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
                </div>
            </div>
        </div>
    </header>
  )
}
