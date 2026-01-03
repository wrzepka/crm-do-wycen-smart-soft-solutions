import type { NextAuthConfig } from 'next-auth';
import type { Role } from '@/generated/prisma/enums';

export const authConfig = {
  pages: {
    signIn: '/login',
    signOut: '/logout',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.role = token.role as Role;
        session.user.id = token.id as string;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnLoginPage = nextUrl.pathname.startsWith('/login');

      // If user is on the login, and is already logged in, redirect him to the dashboard.
      if (isOnLoginPage) {
        if (isLoggedIn) {
          return Response.redirect(new URL('/dashboard', nextUrl));
        }
        return true;
      }

      if (isOnDashboard) {
        // if user is logged in allow him to go to /dashboard
        // else redirect him to login page
        return isLoggedIn;
      }

      // Logic for main page.
      // If user is logged in redirect him to the dashboard.
      // Otherwise, to the login page.
      if (nextUrl.pathname === '/') {
        if (isLoggedIn) {
          return Response.redirect(new URL('/dashboard', nextUrl));
        }
        return Response.redirect(new URL('/login', nextUrl));
      }

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
