import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Credentials from 'next-auth/providers/credentials';
import { loginSchema } from '@/lib/schemas/authSchema';
import { prisma } from '@/lib/prisma-client';
import { Role } from '@/generated/prisma/enums';
import { type Adapter } from '@auth/core/adapters';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Hasło', type: 'password' },
      },
      async authorize(credentials) {
        const parsedCredentials = loginSchema.safeParse(credentials);

        if (!parsedCredentials.success) {
          return null;
        }

        const { email } = parsedCredentials.data;

        const user = await prisma.users.findUnique({
          where: { email },
        });

        // FOR TEST ONLY!!!!!!!!!!!!!!!!!
        if (!user) {
          return {
            id: '1',
            email: email,
            role: Role.MANAGER,
          };
        }

        if (email === 'manager@crm.pl') {
          return {
            id: user.id.toString(),
            email: user.email,
            role: user.role as Role,
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as Role;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
