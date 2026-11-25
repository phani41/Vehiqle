import { Skeleton } from "@/components/ui/skeleton";

export default function CarDetailsLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Image gallery skeleton */}
        <div className="w-full lg:w-7/12">
          <Skeleton className="aspect-video rounded-lg w-full mb-4" />
          <div className="flex gap-2 overflow-hidden">
            {Array(4).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-20 w-24 flex-shrink-0 rounded-md" />
            ))}
          </div>
          <div className="flex mt-4 gap-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 flex-1" />
          </div>
        </div>
        {/* Details skeleton */}
        <div className="w-full lg:w-5/12 space-y-4">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-8 w-1/3" />
          <div className="grid grid-cols-3 gap-4 my-6">
            {Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </div>
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-lg" />
        </div>
      </div>
      {/* Details section */}
      <div className="mt-12 p-6 bg-white rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <Skeleton className="h-7 w-32" />
            {Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
          <div className="space-y-3">
            <Skeleton className="h-7 w-24" />
            {Array(4).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-5 w-3/4" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
