import { DefaultSession, DefaultUser } from 'next-auth';
import '@auth/core/adapters';
import type { Role } from '@/generated/prisma/enums';

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
    id?: string;
    role: Role;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: Role;
  }
}

declare module '@auth/core/adapters' {
  interface AdapterUser {
    role: Role;
  }
}

declare module 'next-auth/node_modules/@auth/core/adapters' {
  interface AdapterUser {
    role: Role;
  }
}
