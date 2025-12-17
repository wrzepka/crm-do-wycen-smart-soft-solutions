import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Credentials from 'next-auth/providers/credentials';
import { loginSchema } from '@/lib/schemas/authSchema';
import { prisma } from '@/lib/prisma-client';
import { Role } from '@/generated/prisma/enums';
import { type Adapter } from '@auth/core/adapters';
import { authConfig } from './auth.config'; // Import konfiguracji

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig, // Unpack base (light) config
  adapter: PrismaAdapter(prisma) as Adapter,
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = loginSchema.safeParse(credentials);

        if (!parsedCredentials.success) return null;

        const { email } = parsedCredentials.data;
        const user = await prisma.users.findUnique({ where: { email } });

        // FOR TESTS ONLY
        if (!user) {
          return { id: '1', email: email, role: Role.MANAGER };
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
});
