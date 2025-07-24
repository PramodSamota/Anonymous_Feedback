import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
export { default } from "next-auth/middleware";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });

  console.log("token", token);
  const url = request.nextUrl;
  console.log("url", url.pathname);

  // If user is authenticated and trying to access auth pages or home, redirect to dashboard
  if (token) {
    console.log("User is authenticated");
    if (["/sign-in", "/signup", "/"].includes(url.pathname)) {
      console.log("Redirecting to dashboard");
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // 4. Handle unauthenticated user
  if (url.pathname.startsWith("/dashboard")) {
    console.log("Redirecting to sign-in");
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/", "/sign-in", "/signup", "/dashboard/:path*"],
};
