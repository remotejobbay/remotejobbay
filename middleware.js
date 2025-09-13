import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Redirect old login and signup to auth
  if (pathname === '/login' || pathname === '/signup') {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  // Redirect or 404 for removed pages
  if (pathname === '/payment' || pathname === '/thank-you') {
    return NextResponse.redirect(new URL('/', request.url)); // Or return NextResponse.next() for 404
  }

  return NextResponse.next();
}

// Match all routes (adjust if needed for specific paths)
export const config = {
  matcher: ['/((?!_next).*)'],
};