import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  console.log("🛡️ Middleware called for:", request.nextUrl.pathname); 
  
  const isLoggedIn = request.cookies.get('isLoggedIn')?.value === 'true';
  const url = request.nextUrl.clone();
  
  console.log("🔐 isLoggedIn cookie:", isLoggedIn);
  
  if (url.pathname.includes('/oauth2/') || 
      url.pathname.includes('/login/oauth2/') ||
      url.pathname.includes('/github/login/oauth/') || // GitHub specific paths
      url.searchParams.has('code') || 
      url.searchParams.has('token') ||
      url.searchParams.has('auth') ||
      url.searchParams.has('state')) {
    console.log("✅ OAuth callback detected, allowing through"); 
    return NextResponse.next();
  }
  
  if (url.pathname === '/signin') {
    console.log("✅ Signin page, allowing through"); 
    return NextResponse.next();
  }

  const referer = request.headers.get('referer') || '';
  const hasOAuthReferer = isValidOAuthReferer(referer);
  
  if (hasOAuthReferer) {
    console.log("✅ Valid OAuth referer, allowing through"); 
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    const fromSignin = referer && referer.includes('/signin');
    if (fromSignin) {
      console.log("⚠️ Preventing redirect loop from signin page"); 
      return NextResponse.next();
    }
    
    console.log("❌ Not logged in, redirecting to signin"); 
    return NextResponse.redirect(new URL('/signin', request.url));
  }
  
  console.log("✅ Allowing request through"); 
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
      'api.github.com',
      'github.io',
      'githubusercontent.com',
      'githubassets.com',
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
