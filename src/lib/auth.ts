import 'dotenv/config';
import { NextAuthOptions } from 'next-auth';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { PrismaClient, Role } from '@/generated/prisma/client';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { Adapter } from 'next-auth/adapters';

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// Config declaration
const config = {
  adapter: PrismaAdapter(prisma) as Adapter,

  // 2. Login provider
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (credentials == null) {
          return null;
        }

        // find user with right email
        const user = await prisma.users.findUnique({
          where: { email: credentials.email },
        });

        // TODO: UNCOMMENT WHEN DEPLOY
        /*        if (user == null) {
          return null;
        }*/

        //TODO: DELETE WHEN DEPLOY
        if (user == null) {
          return {
            id: String(1),
            email: 'manager@crm.pl',
            role: 'MANAGER',
          };
        }

        /* ... (In future password validation) */
        console.log('CHUJ');
        console.log(user.email);
        // ONLY FOR TESTS!
        if (user.email === 'manager@crm.pl') {
          return {
            id: String(user.id),
            email: user.email,
            role: user.role,
          };
        }

        return null;
      },
    }),
  ],

  // callbacks functions to inject role field into jwt token and session
  callbacks: {
    // generate jwt token
    async jwt({ token, user }) {
      // add role to token
      if (user) {
        token.role = user.role as Role;
      }
      return token;
    },
    // generate session token
    async session({ session, token }) {
      // add role to session
      if (token && session.user) {
        session.user.role = token.role as Role;
      }
      return session;
    },
  },

  // 4. Session and pages configuration
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthOptions; // end of the config declaration

// export config with name: authOptions
export const authOptions = config as NextAuthOptions;
