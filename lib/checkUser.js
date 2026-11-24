import { auth, currentUser } from "@clerk/nextjs/server";
import { cache } from "react";
import { db } from "./prisma";

export const checkUser = cache(async () => {
  // Fast local JWT check - avoids slow Clerk API network call for unauthenticated visitors
  const { userId } = await auth();
  if (!userId) {
    return null;
  }

  const user = await currentUser();
  if (!user) {
    return null;
  }

  try {
    const loggedInUser = await db.user.findUnique({
      where: {
        clerkUserId: user.id,
      },
    });

    if (!loggedInUser) {
      const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || "User";
      const email = user.emailAddresses?.[0]?.emailAddress || "";
      const newUser = await db.user.create({
        data: {
          clerkUserId: user.id,
          name,
          imageUrl: user.imageUrl,
          email,
        },
      });
      return newUser;
    }

    return loggedInUser;

  } catch (error) {
    console.error("Error in checkUser:", error.message);
    return null;
  }
});
