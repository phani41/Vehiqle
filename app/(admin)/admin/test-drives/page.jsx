import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const TestDrivesList = dynamic(
  () => import("./_components/test-drive-list").then((m) => ({ default: m.TestDrivesList })),
  {
    loading: () => (
      <div className="space-y-4">
        <div className="flex gap-3">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 w-36" />
        </div>
        <div className="border rounded-lg overflow-hidden">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="p-3 border-b">
              <div className="grid grid-cols-6 gap-4 items-center">
                {Array(5).fill(0).map((_, j) => (
                  <Skeleton key={j} className="h-4 w-full" />
                ))}
                <div className="flex gap-2 justify-end">
                  <Skeleton className="h-7 w-16" />
                  <Skeleton className="h-7 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  }
);

export const metadata = {
  title: "Test Drives | Vehiql Admin",
  description: "Manage test drive bookings",
};

export default function TestDrivesPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Test Drive Management</h1>
      <TestDrivesList />
    </div>
  );
}