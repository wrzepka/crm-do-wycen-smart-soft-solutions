// src/lib/prisma-client.ts
import { PrismaClient } from '@/generated/prisma/client'; // POPRAWIONY IMPORT

// Extend the global scope to store PrismaClient instance for hot-reload prevention
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
