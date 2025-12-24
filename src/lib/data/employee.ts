import { prisma } from '@/lib/prisma-client';
// import { EmployeeWithRelations } from '@/types/employee';
import type { FormattedEmployee } from '@/types/employee';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/auth';

/**
 * Fetches all employees with their technologies and positions
 * Returns formatted data for frontend display
 * @returns Promise<FormattedEmployee[]> - List of employees with formatted relations
 */
export async function getEmployeesList(): Promise<FormattedEmployee[]> {
  try {
    // Fetch employees from database with related data
    const employees = await prisma.employees.findMany({
      orderBy: { last_name: 'asc' }, // Alphabetical order by last name
      include: {
        employee_technology: {
          include: {
            technologies: true, // Include technology details
          },
        },
        position: true, // Include position details
      },
    });

    // Transform data: flatten employee_technology relation to technologies array
    return employees.map((emp) => {
      const { employee_technology, ...rest } = emp;
      return {
        ...rest,
        technologies: employee_technology.map((et) => et.technologies),
      } as FormattedEmployee;
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    return []; // Return empty array on error
  }
}

/**
 * Calculates employee statistics for dashboard cards
 * Groups employees by status and counts them
 * @returns Object with counts for each status and total
 */
export async function getEmployeeStats() {
  // Group employees by status and count each group
  const stats = await prisma.employees.groupBy({
    by: ['status'],
    _count: {
      status: true,
    },
  });

  // Initialize result object with all statuses
  const result = {
    total: 0,
    available: 0,
    booked: 0,
    on_leave: 0,
    onboarding: 0,
  };

  // Process each status group
  stats.forEach((group) => {
    const count = group._count.status;
    result.total += count; // Add to total count

    // Map status enum values to result properties
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
