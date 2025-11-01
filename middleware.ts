import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  
  const isLoggedIn = request.cookies.get('isLoggedIn')?.value === 'true';
  const url = request.nextUrl.clone();
  const hostname = url.hostname.toLowerCase();
  
  // Test environment bypass (hardened):
  // Only allow bypass in explicit test environments, and only for GET /start*.
  // Optionally require a secret token header to prevent accidental enabling.
  const appEnv = (process.env.APP_ENV || process.env.NODE_ENV || '').toLowerCase();
  const isTestEnv = appEnv === 'test';
  const isStartPath = url.pathname === '/start' || url.pathname.startsWith('/start/');
  const isGet = request.method === 'GET';
  const bypassToken = process.env.TEST_BYPASS_TOKEN || '';
  const headerToken = request.headers.get('x-test-bypass') || '';
  const hasValidBypassHeader = bypassToken && headerToken === bypassToken;
  if (isTestEnv && isGet && isStartPath && (bypassToken ? hasValidBypassHeader : true)) {
    const res = NextResponse.next();
    res.headers.set('x-middleware-bypass', 'start-route-test');
    return res;
  }

  // Localhost developer bypass:
  // When running locally, allow GET /start and seed lightweight cookies
  // to mimic a logged-in user with username "test".
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
  if (isLocalhost && isGet && isStartPath) {
    const res = NextResponse.next();
    // Only set if not present to avoid clobbering real sessions during dev
    if (!isLoggedIn) {
      res.cookies.set('isLoggedIn', 'true', {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
      });
    }
    const existingUsername = request.cookies.get('username')?.value;
    if (!existingUsername) {
      res.cookies.set('username', 'test', {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
      });
    }
    res.headers.set('x-middleware-bypass', 'start-route-localhost');
    return res;
  }
  
  
  if (url.pathname.includes('/oauth2/') || 
      url.pathname.includes('/login/oauth2/') ||
      url.searchParams.has('code') || 
      url.searchParams.has('token') ||
      url.searchParams.has('auth') ||
      url.searchParams.has('state')) {
    return NextResponse.next();
  }
  
  if (url.pathname === '/signin') {
    return NextResponse.next();
  }

  const referer = request.headers.get('referer') || '';
  const hasOAuthReferer = isValidOAuthReferer(referer);
  
  if (hasOAuthReferer) {
    return NextResponse.next();
  }

if (!isLoggedIn) {
    const fromSignin = referer && referer.includes('/signin');
    if (fromSignin) {
      return NextResponse.next();
    }
  
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  return NextResponse.next();
}


function isValidOAuthReferer(refererUrl: string): boolean {
  if (!refererUrl) {
    return false;
  }
  
  try {
    const parsedUrl = new URL(refererUrl);
    const hostname = parsedUrl.hostname.toLowerCase();
    
    const allowedOAuthHosts = [
      'github.com',
      'google.com', 
      'accounts.google.com',
      'oauth.google.com',
    ];
    
    return allowedOAuthHosts.some(allowedHost => {
      if (hostname === allowedHost) {
        return true;
      }
      
      if (hostname.endsWith('.' + allowedHost)) {
        const subdomain = hostname.substring(0, hostname.length - allowedHost.length - 1);
        return subdomain.length > 0 && !subdomain.endsWith('.');
      }
      
      return false;
    });
  } catch (error) {
    console.warn('Invalid referer URL format:', refererUrl);
    return false;
  }
}

export const config = {
  matcher: ['/start/:path*'],
};
