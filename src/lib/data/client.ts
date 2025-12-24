import { prisma } from '@/lib/prisma-client';

// TODO: TEST IT
export async function getClientsList(page: number = 1, pageSize: number = 10) {
  try {
    // Calculate offset
    const skip = (page - 1) * pageSize;

    // Fetch data and calculate number of clients (for pagination)
    const [clients, clientsAmount] = await Promise.all([
      prisma.clients.findMany({
        skip: skip,
        take: pageSize,
        orderBy: { last_name: 'asc', first_name: 'asc' },
      }),
      prisma.clients.count(),
    ]);

    return {
      clients,
      totalPages: Math.ceil(clientsAmount / pageSize),
    };
  } catch (error) {
    console.log('Błąd pobierania klientów: ', error);
    return [];
  }
}
