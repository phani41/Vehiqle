
import { SavedCarsList } from "./_components/saved-cars-list";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getSavedCars } from "@/actions/car-listing";

export const metadata = {
  title: "Saved Cars | Vehiql",
  description: "View your saved cars and favorites",
};

export default async function SavedCarsPage() {
  // Check authentication on server
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect=/saved-cars");
  }

  // Fetch saved cars on the server
  const savedCarsResult = await getSavedCars();

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-6 gradient-title">Your Saved Cars</h1>
      <SavedCarsList initialData={savedCarsResult} />
    </div>
  );
}