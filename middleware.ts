import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const payload = JSON.parse(atob(token.split('.')[1]));
  const role = payload.role;

  if (req.nextUrl.pathname === '/dashboard') {
    return NextResponse.redirect(new URL(`/dashboard/${role}`, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard'],
};
