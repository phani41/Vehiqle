import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

/**
 * Clerk Webhook Handler
 * Listens for Clerk events such as `user.deleted` to ensure any account deleted
 * in Clerk is immediately and completely purged from the PostgreSQL database,
 * removing all associated test drives, saved cars, and personal details.
 */
export async function POST(req) {
  try {
    const payload = await req.json();
    const eventType = payload?.type;

    if (eventType === "user.deleted") {
      const clerkUserId = payload?.data?.id;

      if (clerkUserId) {
        const user = await db.user.findUnique({
          where: { clerkUserId },
        });

        if (user) {
          // Permanently delete all details of that person from the database
          await db.$transaction(async (tx) => {
            await tx.testDrivesBooking.deleteMany({
              where: { userId: user.id },
            });
            await tx.userSavedCar.deleteMany({
              where: { userId: user.id },
            });
            await tx.user.delete({
              where: { id: user.id },
            });
          });

          console.log(`[Webhook] Purged all details for deleted user: ${clerkUserId}`);
        }
      }

      revalidatePath("/");
      revalidatePath("/admin/settings");
      revalidatePath("/admin/test-drives");
      revalidatePath("/reservations");
      revalidatePath("/saved-cars");

      return NextResponse.json({
        success: true,
        message: "User and all details purged from database",
      });
    }

    return NextResponse.json({ success: true, message: "Webhook received" });
  } catch (error) {
    console.error("[Webhook Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
