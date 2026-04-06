import { prisma } from '@/lib/prisma-client';
import { EmployeeStatus } from '@/generated/prisma/enums';

export function isValidStatus(val: string): val is EmployeeStatus {
  return Object.values(EmployeeStatus).includes(val as EmployeeStatus);
}

// This is safe version of getEmployees(), without hourly_rate.
export async function getSafeEmployees(
  query: string = '',
  status: string = '',
  position: string = '',
  page: number = 1,
  pageSize: number = 25,
) {
  const statusFilter = isValidStatus(status);
  const positionId = parseInt(position);

  const whereClause = {
    AND: [
      query
        ? {
            OR: [
              { first_name: { contains: query, mode: 'insensitive' as const } },
              { last_name: { contains: query, mode: 'insensitive' as const } },
            ],
          }
        : {},
      statusFilter ? { status: status as EmployeeStatus } : {},
      positionId ? { position_id: positionId } : {},
    ],
  };

  const skip = (page - 1) * pageSize;

  try {
    const [employees, employeesAmount] = await Promise.all([
      prisma.employees.findMany({
        where: whereClause,
        skip: skip,
        take: pageSize,

        orderBy: { last_name: 'asc' },
        select: {
          id: true,
          first_name: true,
          last_name: true,
          busy_from: true,
          busy_to: true,
          status: true,

          employee_technology: {
            select: {
              technologies: true,
            },
          },

          position: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.employees.count({ where: whereClause }),
    ]);

    return {
      employees,
      totalPages: Math.ceil(employeesAmount / pageSize),
    };
  } catch (error) {
    console.error('Błąd pobierania bezpiecznej listy pracowników:', error);
    throw new Error('Nie udało się załadować listy pracowników. Spróbuj odświeżyć stronę.');
  }
}

//gets employee stats for dashboard/employees page cards
export async function getEmployeeStats() {
  const stats = await prisma.employees.groupBy({
    by: ['status'],
    _count: {
      status: true,
    },
  });

  const result = {
    total: 0,
    available: 0,
    booked: 0,
    on_leave: 0,
    onboarding: 0,
  };

  stats.forEach((group) => {
    const count = group._count.status;
    result.total += count;

    if (group.status === 'ACTIVE_AVAILABLE') {
      result.available = count;
    }
    if (group.status === 'ACTIVE_BOOKED') {
      result.booked = count;
    }
    if (group.status === 'ON_LEAVE') {
      result.on_leave = count;
    }
    if (group.status === 'ONBOARDING') {
      result.onboarding = count;
    }
  });

  return result;
}
