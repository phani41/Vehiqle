import { auth, currentUser } from "@clerk/nextjs/server";
import { cache } from "react";
import { db } from "./prisma";

export const checkUser = cache(async () => {
  // Fast local JWT check - avoids slow Clerk API network call for unauthenticated visitors
  const { userId } = await auth();
  if (!userId) {
    return null;
  }

  try {
    // Check local database first using the token userId - 0ms Clerk API network overhead!
    let loggedInUser = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (loggedInUser) {
      return loggedInUser;
    }

    // Only fetch from external Clerk API if the user doesn't exist in local database yet
    const user = await currentUser();
    if (!user) {
      return null;
    }

    const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || "User";
    const email = user.emailAddresses?.[0]?.emailAddress || "";
    loggedInUser = await db.user.create({
      data: {
        clerkUserId: user.id,
        name,
        imageUrl: user.imageUrl,
        email,
      },
    });
    return loggedInUser;
  } catch (error) {
    console.error("Error in checkUser:", error.message);
    return null;
  }
});
