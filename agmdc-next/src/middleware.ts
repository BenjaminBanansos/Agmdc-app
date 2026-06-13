import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

if (!process.env.NEXTAUTH_SECRET) {
  process.env.NEXTAUTH_SECRET = "agmdc-super-secret-key-2025";
}

export default withAuth(
  function middleware(req) {
    const url = req.nextUrl.pathname;
    const userRole = req.nextauth.token?.role as string;

    // "God-mode" for Superintendent
    if (userRole === "SUPERINTENDENT") {
      // Superintendent can access anything.
      return NextResponse.next();
    }

    // System Admin Routing
    if (url.startsWith("/admin")) {
      if (userRole !== "SYSTEM_ADMIN") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    // Other roles are blocked from /ec and /tribunal
    if (url.startsWith("/ec") || url.startsWith("/tribunal")) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // Only authenticated users can access the matcher routes
    },
    secret: process.env.NEXTAUTH_SECRET || "agmdc-super-secret-key-2025",
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/ec/:path*",
    "/tribunal/:path*",
    "/regional/:path*",
    "/section/:path*",
    "/church/:path*",
    "/departments/:path*",
    "/credentials/:path*",
    "/transfers/:path*",
    "/certificates/:path*",
  ],
};
