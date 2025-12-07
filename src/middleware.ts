import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

// list of protected routes
const PROTECTED_ROUTES = ['/dashboard'];

// Main middleware handler
export default withAuth(
  // this function is only executable when user is logged in
  function middleware(req) {
    const { nextUrl } = req;
    const isAuthenticated = req.nextauth.token != null;

    // redirect if user is already logged in and trying to go to the login page.
    if (isAuthenticated && nextUrl.pathname === '/login') {
      return NextResponse.redirect(new URL('/dashboard', nextUrl.origin));
    }

    // everything is fine, redirect
    return NextResponse.next();
  },

  // withAuth options
  {
    callbacks: {
      // If return false, withAuth automatically redirect user to pages.signIn (./login)
      authorized: ({ token, req }) => {
        const { nextUrl } = req;

        // check if path is protected
        const isProtected = PROTECTED_ROUTES.some((path) => nextUrl.pathname.startsWith(path));

        // return true if token exist or if path is not protected
        return !!token || !isProtected;
      },
    },

    // same like in the config
    // show NextAuth where is signIn page
    pages: {
      signIn: '/login',
    },
  },
);

// Matcher configuration
export const config = {
  // Block all routes (.*) except static files, API's or system folders
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
