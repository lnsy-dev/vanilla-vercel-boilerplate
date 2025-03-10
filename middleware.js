import { NextResponse } from '@vercel/edge';

// Export the Edge Function configuration
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
  // Specify which env vars are available to the edge function
  env: ['PASSWORD'],
};

export default function middleware(request) {
  // Debug logging for environment variable
  console.log('Environment check:', {
    passwordExists: typeof process.env.PASSWORD !== 'undefined',
    passwordValue: process.env.PASSWORD || 'not set'
  });

  // If no password is set in env, allow access without authentication
  if (typeof process.env.PASSWORD === 'undefined' || process.env.PASSWORD === '') {
    return NextResponse.next();
  }

  const authHeader = request.headers.get('authorization');

  if (!authHeader) {
    return new NextResponse(null, {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Password Required"',
      },
    });
  }

  try {
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = atob(base64Credentials);
    const password = credentials.split(':').pop();

    if (password === process.env.PASSWORD) {
      return NextResponse.next();
    }

    return new NextResponse(null, {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Password Required"',
      },
    });
  } catch (error) {
    console.error('Auth error:', error);
    return new NextResponse(null, {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Password Required"',
      },
    });
  }
}

// Add this configuration to specify which env vars should be available
export const runtime = 'edge';

// This is crucial - we need to explicitly specify which env vars we want access to
export const envVarsConfig = {
  env: ['PASSWORD'],
};
