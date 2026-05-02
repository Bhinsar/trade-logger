import NextAuth from "next-auth";
import { authConfig } from "@/src/auth.config";

/**
 * Middleware runs on the Edge Runtime.
 * We ONLY import authConfig here — NO Mongoose, NO Node.js-only modules.
 * All route protection logic lives in authConfig's `authorized` callback.
 */
export default NextAuth(authConfig).auth;

export const config = {
  /*
   * Match all request paths EXCEPT:
   * - Next.js internals (_next/static, _next/image)
   * - Static assets (favicon, images)
   * - NextAuth API routes (/api/auth/*) — must be excluded so NextAuth
   *   can respond with JSON instead of being redirected to /login
   */
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
