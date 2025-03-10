import { NextResponse } from '@vercel/edge';

export default function middleware(request) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader) {
    return new NextResponse(JSON.stringify({ error: 'No authorization header' }), {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
        'WWW-Authenticate': 'Basic realm="Secure Area"',
      },
    });
  }

  try {
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = atob(base64Credentials);
    const [, password] = credentials.split(':');

    // Debug log (will show in Vercel logs)
    console.log('Auth attempt:', {
      hasPassword: !!process.env.PASSWORD,
      providedPassword: password,
      matches: password === process.env.PASSWORD
    });

    if (password === process.env.PASSWORD) {
      // Forward the request to the static files
      return NextResponse.next();
    }

    return new NextResponse(JSON.stringify({ error: 'Invalid credentials' }), {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
        'WWW-Authenticate': 'Basic realm="Secure Area"',
      },
    });
  } catch (error) {
    console.error('Auth error:', error);
    return new NextResponse(JSON.stringify({ error: 'Authentication error' }), {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
        'WWW-Authenticate': 'Basic realm="Secure Area"',
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
