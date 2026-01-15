import { prisma } from '@/lib/prisma-client';
import type { technologies } from '@/generated/prisma/client';

export async function getTechnologies(): Promise<technologies[]> {
  try {
    const technologiesList = await prisma.technologies.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
      },
    });

    return technologiesList;
  } catch (err) {
    console.log('Błąd podczas pobierania technologii: ', err);
    throw new Error('Nie udało się załadować listy technologii. Spróbuj odświeżyć stronę.');
  }
}

export async function getTechnologiesWithCount(
  query: string = '',
  page: number = 1,
  pageSize: number = 25,
) {
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
    const [technologiesList, technologiesAmount] = await Promise.all([
      prisma.technologies.findMany({
        where: whereClause,
        skip: skip,
        take: pageSize,

        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              employee_technology: true,
            },
          },
        },
      }),
      prisma.technologies.count({ where: whereClause }),
    ]);

    return {
      technologiesList,
      totalPages: Math.ceil(technologiesAmount / pageSize),
    };
  } catch (err) {
    console.log('Błąd podczas pobierania technologii: ', err);
    throw new Error('Nie udało się załadować listy technologii. Spróbuj odświeżyć stronę.');
  }
}
