import { Skeleton } from "@/components/ui/skeleton";

export default function AdminTestDrivesLoading() {
  return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-8 w-40 mb-6" />
      <div className="flex gap-3">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 w-36" />
      </div>
      <div className="border rounded-lg overflow-hidden">
        <div className="p-3 border-b bg-gray-50">
          <div className="grid grid-cols-6 gap-4">
            {Array(6).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-4" />
            ))}
          </div>
        </div>
        {Array(6).fill(0).map((_, i) => (
          <div key={i} className="p-3 border-b">
            <div className="grid grid-cols-6 gap-4 items-center">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <div className="flex gap-2 justify-end">
                <Skeleton className="h-7 w-16" />
                <Skeleton className="h-7 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
