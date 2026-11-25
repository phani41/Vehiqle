import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const AddCarForm = dynamic(
  () => import("../../../cars/_components/add-car-form").then((m) => ({ default: m.AddCarForm })),
  {
    loading: () => (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array(8).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-10 w-32" />
      </div>
    ),
  }
);

export const metadata = {
  title: "Add New Car | Vehiql Admin",
  description: "Add a new car to your marketplace",
};

export default function AdminAddCarPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Add New Car</h1>
      <AddCarForm />
    </div>
  );
}