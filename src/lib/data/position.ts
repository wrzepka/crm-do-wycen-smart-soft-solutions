import { prisma } from '@/lib/prisma-client';
import type { positions } from '@/generated/prisma/client';

export async function getPositions(): Promise<positions[]> {
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

export async function getPositionsOptions(): Promise<{ id: number; name: string }[]> {
  try {
    const positions = await prisma.positions.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: 'asc' },
    });
    return positions;
  } catch (error) {
    console.error('Błąd pobierania stanowisk', error);
    return [];
  }
}

// additional function for getting with pay roll or smth idk how is it called
export async function getPositionsWithHourlyRate() {
  try {
    const positions = await prisma.positions.findMany({
      select: {
        id: true,
        name: true,
        hourly_rate: true,
        _count: {
          select: {
            employees: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
    return positions;
  } catch (error) {
    console.error('Błąd pobierania stanowisk ze stawką:', error);
    return [];
  }
}
