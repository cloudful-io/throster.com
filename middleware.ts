import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { rootDomain } from '@/lib/utils';

function extractSubdomain(request: NextRequest): string | null {
  const url = request.url;
  const host = request.headers.get('host') || '';
  const hostname = host.split(':')[0];

  // Local development environment
  if (url.includes('localhost') || url.includes('127.0.0.1')) {
    // Try to extract subdomain from the full URL
    const fullUrlMatch = url.match(/http:\/\/([^.]+)\.localhost/);
    if (fullUrlMatch && fullUrlMatch[1]) {
      return fullUrlMatch[1];
    }

    // Fallback to host header approach
    if (hostname.includes('.localhost')) {
      return hostname.split('.')[0];
    }

    return null;
  }

  // Production environment
  const rootDomainFormatted = rootDomain.split(':')[0];

  // Handle preview deployment URLs (tenant---branch-name.vercel.app)
  if (hostname.includes('---') && hostname.endsWith('.vercel.app')) {
    const parts = hostname.split('---');
    return parts.length > 0 ? parts[0] : null;
  }

  // Regular subdomain detection
  const isSubdomain =
    hostname !== rootDomainFormatted &&
    hostname !== `www.${rootDomainFormatted}` &&
    hostname.endsWith(`.${rootDomainFormatted}`);

  return isSubdomain ? hostname.replace(`.${rootDomainFormatted}`, '') : null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const subdomain = extractSubdomain(request);

  // ── Supabase session refresh ──────────────────────────────────────
  // Create a response that we'll modify with updated cookies
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Set cookies on the request for downstream server components
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // Also set cookies on the response for the browser
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session (this updates cookies if the token was refreshed)
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    console.log(`[Middleware] User detected on ${subdomain || 'root'}: ${user.email}`);
  } else {
    console.log(`[Middleware] No user detected on ${subdomain || 'root'}`);
  }

  // ── Subdomain routing ─────────────────────────────────────────────
  if (subdomain) {
    // Block access to root-level admin from subdomains
    if (pathname.startsWith('/admin')) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }

    // Rewrite subdomain requests to the tenant route group
    if (pathname === '/') {
      const url = request.nextUrl.clone();
      url.pathname = `/s/${subdomain}`;
      response = NextResponse.rewrite(url, {
        request: { headers: request.headers },
      });
    } else {
      // For all other paths on the subdomain, prefix with /s/[subdomain]
      const url = request.nextUrl.clone();
      url.pathname = `/s/${subdomain}${pathname}`;
      response = NextResponse.rewrite(url, {
        request: { headers: request.headers },
      });
    }

    // Pass subdomain as a header for downstream use
    response.headers.set('x-tenant-subdomain', subdomain);

    return response;
  }

  // ── Root domain routing ───────────────────────────────────────────
  // Protected routes on the root domain that require authentication
  const protectedRootPaths = ['/admin'];
  const isProtected = protectedRootPaths.some((p) => pathname.startsWith(p));

  if (isProtected) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. all root files inside /public (e.g. /favicon.ico)
     */
    '/((?!api|_next|[\\w-]+\\.\\w+).*)'
  ]
};
