import { Skeleton } from "@/components/ui/skeleton";

export default function ReservationsLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Skeleton className="h-12 w-56 mb-8" />
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-4" />
          <div className="space-y-3">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-16 w-20 rounded-md" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
