import { prisma } from '@/lib/prisma-client';

export async function getClientsList() {
  try {
    const clients = await prisma.clients.findMany({
      orderBy: { last_name: 'asc', first_name: 'asc' },
    });
    return clients;
  } catch (error) {
    console.log('Błąd pobierania klientów: ', error);
    return [];
  }
}
