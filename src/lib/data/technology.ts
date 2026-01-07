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

export async function getTechnologiesWithCount() {
  try {
    const technologiesList = await prisma.technologies.findMany({
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
    });

    return technologiesList;
  } catch (err) {
    console.log('Błąd podczas pobierania technologii: ', err);
    throw new Error('Nie udało się załadować listy technologii. Spróbuj odświeżyć stronę.');
  }
}
