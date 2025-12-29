import { Prisma } from '@/generated/prisma/client';

// -- Prisma types --
// TODO: add projects and history in future
export type ClientWithRelations = Prisma.clientsGetPayload<{
  include: {
    client_addresses: true;
  };
}>;
