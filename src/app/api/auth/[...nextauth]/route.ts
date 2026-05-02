import NextAuth from "next-auth";
import { connectToDatabase } from "@/src/lib/mongodb";
import { User } from "@/src/models/User";
import Google from "next-auth/providers/google";

/**
 * Full auth config with Mongoose callbacks.
 * This runs on the Node.js runtime only (API routes, Server Components).
 * Do NOT import this in middleware.ts.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthPage = nextUrl.pathname.startsWith("/login");

      // Allow auth pages always
      if (isAuthPage) {
        // If already logged in, redirect away from login/register to dashboard
        if (isLoggedIn) {
          return Response.redirect(new URL("/", nextUrl));
        }
        return true;
      }

      // For all other pages, require the user to be logged in
      if (!isLoggedIn) {
        return false; // Middleware will redirect to signIn page automatically
      }

      return true;
    },
    async signIn({ account, profile }) {
      try {
        if (account?.provider === "google") {
          await connectToDatabase();

          const existingUser = await User.findOne({ google_id: profile?.sub });

          if (!existingUser) {
            await User.create({
              google_id: profile?.sub,
              first_name:
                profile?.given_name ||
                profile?.name?.split(" ")[0] ||
                "Unknown",
              last_name:
                profile?.family_name ||
                profile?.name?.split(" ").slice(1).join(" ") ||
                "Unknown",
              email: profile?.email,
              image: profile?.picture,
            });
          }
        }
        return true;
      } catch (error) {
        console.error("❌ Sign In Error:", error);
        return false;
      }
    },
    async jwt({ token, account, profile }) {
      if (account && profile) {
        try {
          await connectToDatabase();
          const dbUser = await User.findOne({ email: profile.email });
          if (dbUser) {
            token.id = dbUser._id.toString();
          }
        } catch (error) {
          console.error("❌ JWT Callback Error:", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});

export const { GET, POST } = handlers;
