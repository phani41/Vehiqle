"use server";

import { serializedCarData } from "@/lib/helper";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath, unstable_cache } from "next/cache";



export async function getAdmin() {
  const { userId } = await auth();
  if (!userId) {
    return { authorized: false, reason: "unauthenticated" };
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  // If user not found in our db or not an admin, return not authorized
  if (!user || user.role !== "ADMIN") {
    return { authorized: false, reason: "not-admin" };
  }

  return { authorized: true, user };
}

/**
 * Get all test drives for admin with filters
 */
export async function getAdminTestDrives({ search = "", status = "" }) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Verify admin status
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user || user.role !== "ADMIN") {
      throw new Error("Unauthorized access");
    }

    // Build where conditions
    let where = {};

    // Add status filter
    if (status) {
      where.status = status;
    }

    // Add search filter
    if (search) {
      where.OR = [
        {
          car: {
            OR: [
              { make: { contains: search, mode: "insensitive" } },
              { model: { contains: search, mode: "insensitive" } },
            ],
          },
        },
        {
          user: {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      ];
    }

    // Get bookings
    const bookings = await db.testDrivesBooking.findMany({
      where,
      include: {
        car: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            imageUrl: true,
            phone: true,
          },
        },
      },
      orderBy: [{ bookingDate: "desc" }, { startTime: "asc" }],
    });

    // Format the bookings
    const formattedBookings = bookings.map((booking) => ({
      id: booking.id,
      carId: booking.carId,
      car: serializedCarData(booking.car),
      userId: booking.userId,
      user: booking.user,
      bookingDate: booking.bookingDate.toISOString(),
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: booking.status,
      notes: booking.notes,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
    }));

    return {
      success: true,
      data: formattedBookings,
    };
  } catch (error) {
    console.error("Error fetching test drives:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Update test drive status
 */
export async function updateTestDriveStatus(bookingId, newStatus) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Verify admin status
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user || user.role !== "ADMIN") {
      throw new Error("Unauthorized access");
    }

    // Get the booking
    const booking = await db.testDrivesBooking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    // Validate status
    const validStatuses = [
      "PENDING",
      "CONFIRMED",
      "COMPLETED",
      "CANCELLED",
      "NO_SHOW",
    ];
    if (!validStatuses.includes(newStatus)) {
      return {
        success: false,
        error: "Invalid status",
      };
    }

    // Update status
    await db.testDrivesBooking.update({
      where: { id: bookingId },
      data: { status: newStatus },
    });

    // Revalidate paths and dashboard cache tag
    revalidatePath("/admin/test-drives");
    revalidatePath("/reservations");

    return {
      success: true,
      message: "Test drive status updated successfully",
    };
  } catch (error) {
    throw new Error("Error updating test drive status:" + error.message);
  }
}

// Cached DB-only stats query — invalidated whenever cars or test-drives change
const _getCachedDashboardStats = unstable_cache(
  async () => {
    const [cars, testDrives] = await Promise.all([
      db.car.findMany({
        select: { id: true, status: true, featured: true },
      }),
      db.testDrivesBooking.findMany({
        select: { id: true, status: true, carId: true },
      }),
    ]);

    const availableCars = cars.filter((c) => c.status === "AVAILABLE").length;
    const soldCars = cars.filter((c) => c.status === "SOLD").length;
    const featuredCars = cars.filter((c) => c.featured === true).length;

    const completedTestDriveCarIds = new Set(
      testDrives.filter((td) => td.status === "COMPLETED").map((td) => td.carId)
    );
    const soldCarsAfterTestDrive = cars.filter(
      (c) => c.status === "SOLD" && completedTestDriveCarIds.has(c.id)
    ).length;
    const completedTestDrives = testDrives.filter(
      (td) => td.status === "COMPLETED"
    ).length;
    const conversionRate =
      completedTestDrives > 0
        ? (soldCarsAfterTestDrive / completedTestDrives) * 100
        : 0;

    return {
      cars: {
        total: cars.length,
        available: availableCars,
        sold: soldCars,
        unavailable: cars.filter((c) => c.status === "UNAVAILABLE").length,
        featured: featuredCars,
      },
      testDrives: {
        total: testDrives.length,
        pending: testDrives.filter((td) => td.status === "PENDING").length,
        confirmed: testDrives.filter((td) => td.status === "CONFIRMED").length,
        completed: completedTestDrives,
        cancelled: testDrives.filter((td) => td.status === "CANCELLED").length,
        noShow: testDrives.filter((td) => td.status === "NO_SHOW").length,
        conversionRate: parseFloat(conversionRate.toFixed(2)),
      },
    };
  },
  ["dashboard-stats"],
  {
    revalidate: 60, // 60-second TTL — revalidated by tag on mutations
    tags: ["cars", "test-drives"],
  }
);

export async function getDashboardData() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Verify admin status
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    // Use cached stats (safe — these are global aggregate counts, not user-specific)
    const data = await _getCachedDashboardStats();

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching dashboard data:", error.message);
    return { success: false, error: error.message };
  }
}