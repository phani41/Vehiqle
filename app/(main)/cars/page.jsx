import { getCarFilters, getCars } from "@/actions/car-listing";
import { CarFilters } from "./_components/car-filters";
import { CarListings } from "./_components/car-listing";

export const metadata = {
  title: "Cars | Vehiqle",
  description: "Browse and search for your dream car",
};

export default async function CarsPage({ searchParams }) {
  const resolvedParams = (await searchParams) || {};
  const page = parseInt(resolvedParams.page || "1");
  const minPrice = resolvedParams.minPrice ? parseFloat(resolvedParams.minPrice) : 0;
  const maxPrice = resolvedParams.maxPrice ? parseFloat(resolvedParams.maxPrice) : Number.MAX_SAFE_INTEGER;

  // Fetch filters AND cars on the server in parallel (SSR for instant first paint)
  const [filtersData, initialCarsData] = await Promise.all([
    getCarFilters(),
    getCars({
      search: resolvedParams.search || "",
      make: resolvedParams.make || "",
      bodyType: resolvedParams.bodyType || "",
      fuelType: resolvedParams.fuelType || "",
      transmission: resolvedParams.transmission || "",
      minPrice,
      maxPrice,
      sortBy: resolvedParams.sortBy || "newest",
      page,
      limit: 6,
    }),
  ]);

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 gradient-title">Browse Cars</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Section */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <CarFilters filters={filtersData.data} />
        </div>

        {/* Car Listings */}
        <div className="flex-1">
          <CarListings initialData={initialCarsData} />
        </div>
      </div>
    </div>
  );
}