import { Skeleton } from "@/components/ui/skeleton";

export default function CarsLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Skeleton className="h-12 w-64 mb-8" />
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters skeleton */}
        <div className="w-full lg:w-80 flex-shrink-0 space-y-6">
          <Skeleton className="h-8 w-32 mb-4" />
          <Skeleton className="h-6 w-full" />
          <div className="space-y-3">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <div className="flex flex-wrap gap-2">
                  {Array(3).fill(0).map((_, j) => (
                    <Skeleton key={j} className="h-7 w-16 rounded-full" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Car grid skeleton */}
        <div className="flex-1">
          <Skeleton className="h-6 w-40 mb-5" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="rounded-lg border overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-4 w-4/5" />
                  <div className="flex gap-2 pt-1">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-14 rounded-full" />
                  </div>
                  <Skeleton className="h-9 w-full mt-2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
