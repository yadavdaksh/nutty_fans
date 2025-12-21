import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session_token');
  const { pathname } = request.nextUrl;

  // Routes that require authentication
  const protectedRoutes = ['/admin', '/dashboard', '/verify-otp', '/verify-age', '/onboarding', '/profile', '/messages', '/content'];
  
  // Routes that are for guests only (redirect to dashboard if logged in)
  const authRoutes = ['/login', '/signup'];

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // If trying to access protected route without session
  if (isProtectedRoute && !session) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Admin route protection
  if (pathname.startsWith('/admin')) {
    const isAdmin = request.cookies.get('is_admin');
    if (!session || !isAdmin) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // If trying to access auth routes while logged in
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
