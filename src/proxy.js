import { NextResponse } from 'next/server';

// Note: auth-gating can't reliably happen here anymore — the auth cookie is
// set by the backend on a different domain (onrender.com) than this app
// (vercel.app), so Next.js never sees it in this cross-domain request.
// Route protection is instead handled client-side (see Sidebar.jsx, which
// calls authAPI.me() and redirects to /login on failure).

export function proxy(request) {
  const { pathname, searchParams } = request.nextUrl;

  // Handle token passed via URL query param (from Google OAuth), if that flow is ever completed
  const urlToken = searchParams.get('token');
  if (urlToken) {
    const response = NextResponse.redirect(new URL('/dashboard', request.url));
    response.cookies.set('token', urlToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });
    return response;
  }

  if (pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
