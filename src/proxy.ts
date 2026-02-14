import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const session = request.cookies.get('session_token');
  const hasSession = !!session?.value;
  const { pathname } = request.nextUrl;

  // Routes that require authentication
  const protectedRoutes = [
    '/admin', 
    '/dashboard', 
    '/verify-otp', 
    '/verify-age', 
    '/onboarding', 
    '/profile', 
    '/messages', 
    '/content',
    '/discover',
    '/live',
    '/subscription',
    '/wallet',
    '/settings'
  ];
  
  // Routes that are for guests only (redirect to dashboard if logged in)
  const authRoutes = ['/login', '/signup'];

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // If trying to access protected route without session
  if (isProtectedRoute && !hasSession) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Admin route protection
  if (pathname.startsWith('/admin')) {
    const isAdmin = request.cookies.get('is_admin');
    if (!hasSession || !isAdmin) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // If trying to access auth routes while logged in
  if (isAuthRoute && hasSession) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If already onboarding completed, redirect away from onboarding routes
  const onboardingCompleted = request.cookies.get('onboarding_completed');
  const userRole = request.cookies.get('user_role')?.value;
  const onboardingRoutes = ['/onboarding', '/verify-otp', '/verify-age'];
  const isOnboardingRoute = onboardingRoutes.some(route => pathname.startsWith(route));

  if (isOnboardingRoute && onboardingCompleted) {
    if (userRole === 'creator') {
      return NextResponse.redirect(new URL('/verification-pending', request.url));
    }
    return NextResponse.redirect(new URL('/', request.url));
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
