"use server";
import { db } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getDealershipInfo() {
    try {
        const { userId } = await auth();
        if (!userId) throw new Error ("Unauthorized");
         const user = await db.user.findUnique({
                 where: { clerkUserId: userId},
                });
         
                 if (!user) throw new Error("User not found");


                 let dealership = await db.dealershipInfo.findFirst({
                    include: {
                      workingHours: {
                        orderBy: {
                          dayOfWeek: "asc",
                        },
                      },
                     },
                   });
                   if(!dealership){
                    dealership = await db.dealershipInfo.create({
                        data:{
                            workingHours:{
                            create: [
              {
                dayOfWeek: "MONDAY",
                openTime: "09:00",
                closeTime: "18:00",
                isOpen: true,
              },
              {
                dayOfWeek: "TUESDAY",
                openTime: "09:00",
                closeTime: "18:00",
                isOpen: true,
              },
              {
                dayOfWeek: "WEDNESDAY",
                openTime: "09:00",
                closeTime: "18:00",
                isOpen: true,
              },
              {
                dayOfWeek: "THURSDAY",
                openTime: "09:00",
                closeTime: "18:00",
                isOpen: true,
              },
              {
                dayOfWeek: "FRIDAY",
                openTime: "09:00",
                closeTime: "18:00",
                isOpen: true,
              },
              {
                dayOfWeek: "SATURDAY",
                openTime: "10:00",
                closeTime: "16:00",
                isOpen: true,
              },
              {
                dayOfWeek: "SUNDAY",
                openTime: "10:00",
                closeTime: "16:00",
                isOpen: false,
              },
            ],
          },
        },
        include:{
            workingHours:{
                orderBy:{
                    dayOfWeek:"asc",
                }
            }
        }
     });
    }
    return {
      success: true,
      data: {
        ...dealership,
        createdAt: dealership.createdAt.toISOString(),
        updatedAt: dealership.updatedAt.toISOString(),
      },
    };

    } catch (error) {
         throw new Error("Error fetching dealership info:" + error.message);
    }
        
}

export async function saveWorkingHours(workingHours){
    try {
        const { userId } = await auth();
        if (!userId) throw new Error ("Unauthorized");

        const user = await db.user.findUnique({
                 where: { clerkUserId: userId},
                });
                 if (!user || user.role !== "ADMIN") {
                    throw new Error("Unauthorized: Admin access required");
                 }   
                const dealership = await db.dealershipInfo.findFirst();
                 
                 if (!dealership){
                    throw new Error ("Dealership info not found");
                 }

                 await db.workingHour.deleteMany({
                  where: { dealershipId: dealership.id },
                 });

                 for (const hour of workingHours) {
                   await db.workingHour.create({
                      data: {
                      dayOfWeek: hour.dayOfWeek,
                      openTime: hour.openTime,
                      closeTime: hour.closeTime,
                      isOpen: hour.isOpen,
                      dealershipId: dealership.id,
        },
      });
    }

    revalidatePath("/admin/settings");
    revalidatePath("/"); 

    return {
        success: true,
    };
    } catch (error) {
        throw new Error("Error saving working hours:" + error.message);
    }
}

export async function getUsers() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Check if user is admin
    const adminUser = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!adminUser || adminUser.role !== "ADMIN") {
      throw new Error("Unauthorized: Admin access required");
    }

    // Get all users
    const users = await db.user.findMany({
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: users.map((user) => ({
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      })),
    };
  } catch (error) {
    throw new Error("Error fetching users:" + error.message);
  }
}

// Update user role
export async function updateUserRole(userId, role) {
  try {
    const { userId: adminId } = await auth();
    if (!adminId) throw new Error("Unauthorized");

    // Check if user is admin
    const adminUser = await db.user.findUnique({
      where: { clerkUserId: adminId },
    });

    if (!adminUser || adminUser.role !== "ADMIN") {
      throw new Error("Unauthorized: Admin access required");
    }

    // Update user role
    await db.user.update({
      where: { id: userId },
      data: { role },
    });

    // Revalidate paths
    revalidatePath("/admin/settings");

    return {
      success: true,
    };
  } catch (error) {
    throw new Error("Error updating user role:" + error.message);
  }
}

// Delete user account and wipe all their details from DB and Clerk (Admin action)
export async function deleteUser(targetUserId) {
  try {
    const { userId: adminClerkId } = await auth();
    if (!adminClerkId) throw new Error("Unauthorized");

    // Verify caller is admin
    const adminUser = await db.user.findUnique({
      where: { clerkUserId: adminClerkId },
    });

    if (!adminUser || adminUser.role !== "ADMIN") {
      throw new Error("Unauthorized: Admin access required");
    }

    // Find the target user
    const userToDelete = await db.user.findUnique({
      where: { id: targetUserId },
    });

    if (!userToDelete) {
      throw new Error("User not found");
    }

    if (userToDelete.clerkUserId === adminClerkId) {
      throw new Error("You cannot delete your own admin account from here.");
    }

    // 1. Permanently delete all user details from database in an atomic transaction
    await db.$transaction(async (tx) => {
      // Delete test drives bookings associated with this user
      await tx.testDrivesBooking.deleteMany({
        where: { userId: userToDelete.id },
      });
      // Delete all saved cars
      await tx.userSavedCar.deleteMany({
        where: { userId: userToDelete.id },
      });
      // Delete user record itself
      await tx.user.delete({
        where: { id: userToDelete.id },
      });
    });

    // 2. Permanently delete user from Clerk
    try {
      const client = await clerkClient();
      await client.users.deleteUser(userToDelete.clerkUserId);
    } catch (clerkError) {
      console.warn("Clerk user delete warning (may already be deleted):", clerkError.message);
    }

    // 3. Revalidate paths
    revalidatePath("/admin/settings");
    revalidatePath("/admin/test-drives");
    revalidatePath("/reservations");
    revalidatePath("/saved-cars");

    return {
      success: true,
      message: "User account and all associated details permanently deleted",
    };
  } catch (error) {
    throw new Error("Error deleting user: " + error.message);
  }
}

// Delete current user's own account and wipe all details (User action)
export async function deleteMyAccount() {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId },
    });

    if (user) {
      // 1. Permanently delete all details from database in an atomic transaction
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
    }

    // 2. Permanently delete user from Clerk
    try {
      const client = await clerkClient();
      await client.users.deleteUser(clerkUserId);
    } catch (clerkError) {
      console.warn("Clerk user delete warning (may already be deleted):", clerkError.message);
    }

    revalidatePath("/");
    revalidatePath("/admin/settings");
    revalidatePath("/admin/test-drives");
    revalidatePath("/reservations");
    revalidatePath("/saved-cars");

    return {
      success: true,
      message: "Account deleted successfully",
    };
  } catch (error) {
    throw new Error("Error deleting account: " + error.message);
  }
}

