import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
export { default } from "next-auth/middleware";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const url = request.nextUrl;

  console.log("Middleware - Token:", !!token, "Path:", url.pathname);

  // If user is authenticated and trying to access auth pages or home, redirect to dashboard
  if (token) {
    if (["/sign-in", "/signup", "/"].includes(url.pathname)) {
      console.log("Redirecting authenticated user to dashboard");
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Handle unauthenticated user trying to access protected routes
  if (url.pathname.startsWith("/dashboard")) {
    console.log("Redirecting unauthenticated user to sign-in");
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/", "/sign-in", "/signup", "/dashboard/:path*"],
};
