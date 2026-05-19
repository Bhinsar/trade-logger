"use server";

import { auth, signOut } from "@/src/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/src/lib/mongodb";
import { User } from "@/src/models/User";

import { UserInfo } from "./users.interface";

/**
 * Fetches the current session user's profile, enriched with DB fields.
 * Returns null when the user is not authenticated.
 */
export async function getUserInfo(): Promise<UserInfo | null> {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      await signOutUser();
      return null;
    }

    await connectToDatabase();
    const dbUser = await User.findOne({ email: session.user.email }).lean<{
      _id: { toString(): string };
      first_name?: string;
      last_name?: string;
      email?: string;
      image?: string;
    }>();

    return {
      id: dbUser?._id?.toString() ?? session.user.id ?? "",
      name: session.user.name ?? null,
      email: session.user.email ?? null,
      image: dbUser?.image ?? session.user.image ?? null,
      firstName: dbUser?.first_name ?? null,
      lastName: dbUser?.last_name ?? null,
    };
  } catch (err) {
    console.error("getUserInfo Error:", err);
    return null;
  }
}

/**
 * Signs the current user out and redirects to the login page.
 */
export async function signOutUser() {
  await signOut({ redirectTo: "/login" });
}
