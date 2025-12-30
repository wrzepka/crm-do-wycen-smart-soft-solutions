import { prisma } from '@/lib/prisma-client';
import type { positions } from '@/generated/prisma/client';

export async function getPositionsList(): Promise<positions[]> {
  try {
    const positions = await prisma.positions.findMany({
      orderBy: { name: 'asc' },
      include: {
        employees: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
          },
        },
      },
    });
    return positions;
  } catch (error) {
    console.error('Błąd pobierania stanowisk:', error); // debug log
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
