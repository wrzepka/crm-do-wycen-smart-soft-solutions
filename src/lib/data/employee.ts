import { prisma } from '@/lib/prisma-client';
import { EmployeeWithRelations, SafeEmployee } from '@/types/employee';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/auth';

export async function getEmployees(): Promise<EmployeeWithRelations[]> {
  // const session = getServerSession();

  /*  if (!session) { // in future check also role!
        return [];
    }*/

  //TODO: add the number of assigned projects
  try {
    const employees = await prisma.employees.findMany({
      orderBy: { last_name: 'asc' },
      include: {
        employee_technology: {
          include: {
            technologies: true,
          },
        },
        position: true,
      },
    });

    return employees;
  } catch (error) {
    console.error('Błąd pobierania pracowników:', error); // debug log
    throw new Error('Nie udało się załadować listy pracowników. Spróbuj odświeżyć stronę.');
  }
}

// This is safe version of getEmployees(), without hourly_rate.
export async function getSafeEmployees(): Promise<SafeEmployee[]> {
  try {
    const employees = await prisma.employees.findMany({
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
    });

    return employees;
  } catch (error) {
    console.error('Błąd pobierania bezpiecznej listy pracowników:', error);
    throw new Error('Nie udało się załadować listy pracowników. Spróbuj odświeżyć stronę.');
  }
}

// This is safe version of getEmployees(), without hourly_rate.
export async function getSafeEmployees(): Promise<SafeEmployee[]> {
  try {
    const employees = await prisma.employees.findMany({
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
    });

    return employees;
  } catch (error) {
    console.error('Błąd pobierania bezpiecznej listy pracowników:', error);
    return [];
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
