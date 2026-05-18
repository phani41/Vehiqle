import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ReservationsList } from "./_components/reservations-list";
import { getUserTestDrives } from "@/actions/test-drive";

export const metadata = {
  title: "My Reservations | Vehiql",
  description: "Manage your test drive reservations",
};

export default async function ReservationsPage() {
  // Check authentication on server
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect=/reservations");
  }

  // Fetch reservations on the server
  const reservationsResult = await getUserTestDrives();

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-6 gradient-title">Your Reservations</h1>
      <ReservationsList initialData={reservationsResult} />
    </div>
  );
}