import { Skeleton } from "@/components/ui/skeleton";

export default function TestDriveLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Skeleton className="h-10 w-64 mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Car info skeleton */}
        <div className="md:col-span-1 space-y-4">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
          <div className="space-y-2">
            {Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </div>
        {/* Booking form skeleton */}
        <div className="md:col-span-2 space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-md" />
          <Skeleton className="h-24 w-full rounded-md" />
          <Skeleton className="h-11 w-full rounded-md" />
        </div>
      </div>
    </div>
  );
}
