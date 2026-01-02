import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
export function middleware(request: NextRequest) {
  const userCookie = request.cookies.get('viltrum_user');
  const isLoggedIn = userCookie !== undefined;
  
  const { pathname } = request.nextUrl;

  // Rutas del "app" que requieren autenticación
  const protectedRoutes = [
      '/dashboard', 
      '/wallet', 
      '/transactions', 
      '/store', 
      '/settings', 
      '/admin'
    ];

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // Si el usuario no está logueado e intenta acceder a una ruta protegida,
  // redirigirlo a la página de login.
  if (!isLoggedIn && isProtectedRoute) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Si el usuario está logueado e intenta acceder a la página de login ('/'),
  // redirigirlo al dashboard.
  if (isLoggedIn && pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Si no se cumple ninguna de las condiciones anteriores, permite que la petición continúe.
  return NextResponse.next();
}
 
// Configuración para que el middleware se ejecute en las rutas correctas.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)',
  ],
}
