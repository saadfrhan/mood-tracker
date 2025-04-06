import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get the token from the request
  const token = await getToken({ req: request })

  // Check if the user is authenticated
  const isAuthenticated = !!token

  // Define public routes that don't require authentication
  const isPublicRoute = pathname === "/auth"

  // Redirect to login if accessing a protected route without authentication
  if (!isAuthenticated && !isPublicRoute) {
    return NextResponse.redirect(new URL("/auth", request.url))
  }

  // Redirect to home if accessing login page while authenticated
  if (isAuthenticated && isPublicRoute) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth.js API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
}

