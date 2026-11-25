import { Skeleton } from "@/components/ui/skeleton";

export default function SavedCarsLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Skeleton className="h-12 w-56 mb-8" />
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
              </div>
              <Skeleton className="h-9 w-full mt-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
