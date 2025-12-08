import { DefaultSession, DefaultUser } from 'next-auth';
import { Role } from '@/generated/prisma/client';

// Extend NextAuth.js module
declare module 'next-auth' {
  interface Session extends DefaultSession {
    // extend user object in session
    user: {
      // add field that are used by callbacks
      role: Role;
      id: string;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    role: Role;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: role;
  }
}
