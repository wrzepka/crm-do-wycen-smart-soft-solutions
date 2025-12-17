import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';

// Initialize light configuration (without Prisma)
// Whole authentication is inside of auth.config.ts
export default NextAuth(authConfig).auth;

export const config = {
  // Set matcher to skip images, icons etc
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
