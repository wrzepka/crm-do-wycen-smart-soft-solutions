import { prisma } from '@/lib/prisma-client';
import type { technologies } from '@/generated/prisma/client';

type GetPositionsResult = { ok: true; data: technologies[] } | { ok: false; error: string };

export async function getAllTechnologies(): Promise<GetPositionsResult> {
  try {
    const technologies = await prisma.technologies.findMany({
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

    return { ok: true, data: technologies };
  } catch (err) {
    console.log('Błąd podczas pobierania technologii: ', err);
    const message = err instanceof Error ? err.message : 'Błąd podczas pobierania technologii';
    return { ok: false, error: message };
  }
}
