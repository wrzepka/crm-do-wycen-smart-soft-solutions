import { prisma } from '@/lib/prisma-client';

// Function that is used before integration tests to clear up whole db.
export async function clearDatabase() {
  await prisma.$transaction([
    prisma.employee_technology.deleteMany(),
    prisma.client_addresses.deleteMany(),

    prisma.account.deleteMany(),
    prisma.session.deleteMany(),
    prisma.verificationToken.deleteMany(),

    prisma.clients.deleteMany(),
    prisma.employees.deleteMany(),
    prisma.users.deleteMany(),

    prisma.technologies.deleteMany(),
    prisma.positions.deleteMany(),
  ]);
}
