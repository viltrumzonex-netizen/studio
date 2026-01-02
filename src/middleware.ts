import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
export function middleware(request: NextRequest) {
  // Check for the new httpOnly session cookie
  const sessionCookie = request.cookies.get('viltrum_session');
  const isLoggedIn = sessionCookie !== undefined;
  
  const { pathname } = request.nextUrl;

  const protectedRoutes = [
      '/dashboard', 
      '/wallet', 
      '/transactions', 
      '/store', 
      '/settings', 
      '/admin'
  ];

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (!isLoggedIn && isProtectedRoute) {
    const absoluteURL = new URL('/', request.url);
    return NextResponse.redirect(absoluteURL.toString());
  }

  if (isLoggedIn && pathname === '/') {
    const absoluteURL = new URL('/dashboard', request.url);
    return NextResponse.redirect(absoluteURL.toString());
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
     * - db-test (the database test page)
     * - any files with an extension (e.g. .png)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|db-test|.*\\..*).*)',
  ],
}
