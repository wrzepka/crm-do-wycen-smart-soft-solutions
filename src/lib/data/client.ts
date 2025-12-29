import { prisma } from '@/lib/prisma-client';

export async function getClientsList(page: number = 1, pageSize: number = 25) {
  try {
    const skip = (page - 1) * pageSize;

    const [clients, clientsAmount] = await Promise.all([
      prisma.clients.findMany({
        skip: skip,
        take: pageSize,
        //FIX: Prisma wants an array of objects for sorting

        orderBy: [{ last_name: 'asc' }, { first_name: 'asc' }],
        include: {
          client_addresses: true,
        },
      }),
      prisma.clients.count(),
    ]);

    return {
      clients,
      totalPages: Math.ceil(clientsAmount / pageSize),
    };
  } catch (error) {
    console.error('Błąd pobierania klientów: ', error);
    //FIX: same as above
    return {
      clients: [],
      totalPages: 0,
    };
  }
}
