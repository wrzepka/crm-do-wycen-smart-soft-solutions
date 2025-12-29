import { prisma } from '@/lib/prisma-client';
import type { positions } from '@/generated/prisma/client';

export async function getPositionsList(): Promise<positions[]> {
  try {
    const positions = await prisma.positions.findMany({
      orderBy: { name: 'asc' },
    });
    return positions;
  } catch (error) {
    console.error('Błąd pobierania stanowisk:', error); // debug log
    return [];
  }
}
