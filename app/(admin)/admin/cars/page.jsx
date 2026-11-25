import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const CarsList = dynamic(
  () => import("../../cars/_components/car-list"),
  {
    loading: () => (
      <div className="space-y-4">
        <div className="flex gap-3">
          <Skeleton className="h-9 flex-1 max-w-sm" />
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="border rounded-lg overflow-hidden">
          {Array(6).fill(0).map((_, i) => (
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
    ),
  }
);

export const metadata = {
  title: "Cars | Vehiql Admin",
  description: "Manage cars in your marketplace",
};

export default function AdminCarsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Cars Management</h1>
      <CarsList />
    </div>
  );
}