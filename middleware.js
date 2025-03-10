import { NextResponse } from '@vercel/edge';

export default function middleware(request) {
  // If no password is set in env, allow access without authentication
  if (!process.env.PASSWORD) {
    return NextResponse.next();
  }

  const authHeader = request.headers.get('authorization');

  if (!authHeader) {
    return new NextResponse(JSON.stringify({ error: 'Password required' }), {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
        'WWW-Authenticate': 'Basic realm="Password Required"',
      },
    });
  }

  try {
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = atob(base64Credentials);
    // Since we only care about password, split from the end to handle cases where
    // username might contain ':'
    const password = credentials.split(':').pop();

    // Debug log (will show in Vercel logs)
    console.log('Auth attempt:', {
      hasPassword: true,
      matches: password === process.env.PASSWORD
    });

    if (password === process.env.PASSWORD) {
      return NextResponse.next();
    }

    return new NextResponse(JSON.stringify({ error: 'Invalid password' }), {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
        'WWW-Authenticate': 'Basic realm="Password Required"',
      },
    });
  } catch (error) {
    console.error('Auth error:', error);
    return new NextResponse(JSON.stringify({ error: 'Authentication error' }), {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
        'WWW-Authenticate': 'Basic realm="Password Required"',
      },
    });
  }
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
