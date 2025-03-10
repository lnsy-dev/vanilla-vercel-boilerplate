import { NextResponse } from '@vercel/edge';

export default function middleware(request) {
  // Add debug logging
  console.log('Checking authentication:', {
    hasPassword: !!process.env.PASSWORD,
    passwordLength: process.env.PASSWORD?.length
  });

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

// Add this configuration to specify which env vars should be available
export const runtime = 'edge';

// This is crucial - we need to explicitly specify which env vars we want access to
export const envVarsConfig = {
  env: ['PASSWORD'],
};
