import { Skeleton } from "@/components/ui/skeleton";

export default function AdminSettingsLoading() {
  return (
    <div className="p-6 space-y-6">
      <Skeleton className="h-8 w-32 mb-6" />
      <div className="border rounded-lg p-4 space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
        </div>
      </div>
      <div className="border rounded-lg p-4 space-y-4">
        <Skeleton className="h-6 w-36" />
        {Array(7).fill(0).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-5 w-16" />
          </div>
        ))}
      </div>
      <Skeleton className="h-10 w-32" />
    </div>
  );
}
