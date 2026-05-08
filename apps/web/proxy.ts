import { NextResponse, type NextRequest } from 'next/server';

// Protege /admin/* requiriendo la cookie credia_auth_token (seteada por el
// auth-store del cliente al hacer login). Para defensa real (revocación,
// expiración, audiencias, etc.) el backend valida el JWT en cada request — esto
// es solo el guard de UI para evitar que el dashboard server-render flashee
// antes del redirect client-side.

const COOKIE_NAME = 'credia_auth_token';

export function proxy(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
