import { Skeleton } from "@/components/ui/skeleton";

export default function AdminCarsLoading() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-9 w-24" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-9 flex-1 max-w-sm" />
      </div>
      <div className="border rounded-lg overflow-hidden">
        <div className="p-3 border-b bg-gray-50">
          <div className="grid grid-cols-7 gap-4">
            {Array(7).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-4" />
            ))}
          </div>
        </div>
        {Array(8).fill(0).map((_, i) => (
          <div key={i} className="p-3 border-b">
            <div className="grid grid-cols-7 gap-4 items-center">
              <Skeleton className="h-10 w-14 rounded" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-8 w-8 ml-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
