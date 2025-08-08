import { NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";

export default auth((req) => {
  const isAuthenticated = Boolean(req.auth);
  const pathname = req.nextUrl.pathname;

  // Allow the login page
  if (pathname.startsWith("/login")) return;

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }
});

export const config = {
  matcher: [
    // Protect everything except Next.js assets, images, api, and favicon
    "/((?!_next/static|_next/image|favicon.ico|api).*)",
  ],
};


