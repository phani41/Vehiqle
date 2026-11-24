"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Car as CarIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import useFetch from "@/hooks/use-fetch";
import { toggleSavedCar } from "@/actions/car-listing";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { formatCurrency, formatNumber } from "@/lib/helper";

export const CarCard = ({ car }) => {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(car.wishlisted);

  // Use the useFetch hook
  const {
    loading: isToggling,
    fn: toggleSavedCarFn,
    data: toggleResult,
    error: toggleError,
  } = useFetch(toggleSavedCar);

  // Sync state if server action returns an update
  useEffect(() => {
    if (toggleResult?.success && toggleResult.saved !== isSaved) {
      setIsSaved(toggleResult.saved);
      toast.success(toggleResult.message);
    }
  }, [toggleResult, isSaved]);

  // Revert optimistic update on error
  useEffect(() => {
    if (toggleError) {
      setIsSaved((prev) => !prev);
      toast.error("Failed to update favorites");
    }
  }, [toggleError]);

  // Handle save/unsave car with optimistic UI
  const handleToggleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isSignedIn) {
      toast.error("Please sign in to save cars");
      router.push("/sign-in");
      return;
    }

    if (isToggling) return;

    // Instant optimistic update
    const previousState = isSaved;
    setIsSaved(!previousState);

    try {
      const res = await toggleSavedCarFn(car.id);
      if (res && !res.success) {
        setIsSaved(previousState);
      }
    } catch {
      setIsSaved(previousState);
    }
  };

  const carUrl = `/cars/${car.id}`;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition group">
      <div className="relative h-48">
        <Link href={carUrl} prefetch={true} className="block relative w-full h-full overflow-hidden">
          {car.images && car.images.length > 0 ? (
            <Image
              src={car.images[0]}
              alt={`${car.make} ${car.model}`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-contain object-center group-hover:scale-105 transition duration-300 bg-white"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <CarIcon className="h-12 w-12 text-gray-400" />
            </div>
          )}
        </Link>

        <Button
          variant="ghost"
          size="icon"
          className={`absolute top-2 right-2 bg-white/90 rounded-full p-1.5 z-10 ${
            isSaved
              ? "text-red-500 hover:text-red-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
          onClick={handleToggleSave}
          disabled={isToggling}
        >
          {isToggling ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Heart className={isSaved ? "fill-current" : ""} size={20} />
          )}
        </Button>
      </div>

      <CardContent className="p-4">
        <div className="flex flex-col mb-2">
          <Link href={carUrl} prefetch={true} className="hover:text-blue-600 transition-colors">
            <h3 className="text-lg font-bold line-clamp-1">
              {car.make} {car.model}
            </h3>
          </Link>
          <span className="text-xl font-bold text-blue-600">
            {formatCurrency(car.price)}
          </span>
        </div>

        <div className="text-gray-600 mb-2 flex items-center">
          <span>{car.year}</span>
          <span className="mx-2">•</span>
          <span>{car.transmission}</span>
          <span className="mx-2">•</span>
          <span>{car.fuelType}</span>
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          <Badge variant="outline" className="bg-gray-50">
            {car.bodyType}
          </Badge>
          <Badge variant="outline" className="bg-gray-50">
            {formatNumber(car.mileage)} miles
          </Badge>
          <Badge variant="outline" className="bg-gray-50">
            {car.color}
          </Badge>
        </div>

        <div className="flex justify-between">
          <Button asChild className="flex-1">
            <Link href={carUrl} prefetch={true}>
              View Car
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
