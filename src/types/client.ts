import { Prisma } from '@/generated/prisma/client';

// -- Prisma types --
export type ClientWithRelations = Prisma.clientsGetPayload<{
  include: {
    client_addresses: true;
  };
}>;
