import { prisma } from '@/lib/prisma-client';

export async function getPositions(query: string = '', page: number = 1, pageSize: number = 25) {
  const skip = (page - 1) * pageSize;
  const whereClause = {
    AND: [
      query
        ? {
            name: { contains: query, mode: 'insensitive' as const },
          }
        : {},
    ],
  };

  try {
    const [positions, positionsAmount] = await Promise.all([
      prisma.positions.findMany({
        where: whereClause,
        skip: skip,
        take: pageSize,

        orderBy: { name: 'asc' },
      }),
      prisma.positions.count({ where: whereClause }),
    ]);

    return {
      positions,
      totalPages: Math.ceil(positionsAmount / pageSize),
    };
  } catch (error) {
    console.error('Błąd pobierania stanowisk:', error); // debug log
    throw new Error('Nie udało się załadować listy stanowisk. Spróbuj odświeżyć stronę.');
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
    throw new Error('Nie udało się załadować listy stanowisk. Spróbuj odświeżyć stronę.');
  }
}

// additional function for getting with pay roll or smth idk how is it called
export async function getPositionsWithHourlyRate() {
  try {
    const positions = await prisma.positions.findMany({
      select: {
        id: true,
        name: true,
        cost: true,
        rate: true,
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
    throw new Error('Nie udało się załadować listy stanowisk. Spróbuj odświeżyć stronę.');
  }
}
