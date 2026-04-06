import { PrismaClient } from '@/generated/prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// --- SOLUTION FOR HOT-RELOAD PROBLEM IN DEV ENV ---
// Client creation function
const prismaClientSingleton = () => {
  // Configure pool for connection
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({ connectionString });

  // Create adapter for prisma
  const adapter = new PrismaPg(pool);

  // Initialize new client
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
