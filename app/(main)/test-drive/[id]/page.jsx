import { getCarById } from "@/actions/car-listing";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy-load TestDriveForm — it imports react-day-picker, react-hook-form, zod
const TestDriveForm = dynamic(
  () => import("./_components/test-drive-form").then((m) => ({ default: m.TestDriveForm })),
  {
    loading: () => (
      <div className="space-y-6">
        <div className="flex gap-4">
          <Skeleton className="h-48 w-48 rounded-lg" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
        <Skeleton className="h-64 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    ),
  }
);


export async function generateMetadata() {
  return {
    title: `Book Test Drive | Vehiql`,
    description: `Schedule a test drive in few seconds`,
  };
}

export default async function TestDrivePage({ params }) {
  // Fetch car details
  const { id } = await params;
  const result = await getCarById(id);

  // If car not found, show 404
  if (!result.success) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-6 gradient-title">Book a Test Drive</h1>
      <TestDriveForm
        car={result.data}
        testDriveInfo={result.data.testDriveInfo}
      />
    </div>
  );
}