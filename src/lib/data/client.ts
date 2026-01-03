import { prisma } from '@/lib/prisma-client';

export async function getClientsList(
  query: string = '',
  isLead: string | undefined,
  page: number = 1,
  pageSize: number = 25,
) {
  try {
    // parse Boolean value for client type filter
    const isLeadBoolean = isLead === 'true' ? true : isLead === 'false' ? false : undefined;

    // Clause for filters  (search and rest)
    const whereClause = {
      AND: [
        query
          ? {
              OR: [
                { first_name: { contains: query, mode: 'insensitive' as const } },
                { last_name: { contains: query, mode: 'insensitive' as const } },
                { email: { contains: query, mode: 'insensitive' as const } },
              ],
            }
          : {},
        isLeadBoolean !== undefined ? { is_lead: isLeadBoolean } : {},
      ],
    };

    const skip = (page - 1) * pageSize;

    const [clients, clientsAmount] = await Promise.all([
      prisma.clients.findMany({
        where: whereClause,
        skip: skip,
        take: pageSize,
        //FIX: Prisma wants an array of objects for sorting

        orderBy: [{ last_name: 'asc' }, { first_name: 'asc' }],
        include: {
          client_addresses: true,
        },
      }),
      prisma.clients.count({ where: whereClause }),
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
