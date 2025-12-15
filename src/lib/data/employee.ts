import { prisma } from '@/lib/prisma-client';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/auth';

export async function getEmployeesList() {
  // const session = getServerSession();

  /*  if (!session) { // in future check also role!
      return [];
  }*/

  try {
    const employees = await prisma.employees.findMany({
      orderBy: { last_name: 'asc' },
      include: {
        employee_technology: {
          include: {
            technologies: true,
          },
        },
      },
    });

    return employees;
  } catch (error) {
    console.error('Błąd pobierania pracowników:', error); // debug log
    return [];
  }
}
