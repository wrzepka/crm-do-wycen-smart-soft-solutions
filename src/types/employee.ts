import { z } from 'zod';
import {
  employeeBaseSchema,
  newEmployeeSchema,
  updateEmployeeSchema,
  employeeWithTechnologiesSchema,
  EmployeeStatus,
} from '@/lib/schemas/employeeSchema';
import { Prisma } from '@/generated/prisma/client';

// -- Zod types --
export type Employee = z.infer<typeof employeeBaseSchema>;
export type NewEmployeeInput = z.infer<typeof newEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
export type EmployeeWithTechnologies = z.infer<typeof employeeWithTechnologiesSchema>;
export type EmployeeStatusType = z.infer<typeof EmployeeStatus>;

// -- Prisma types --
export type EmployeeWithRelations = Prisma.employeesGetPayload<{
  include: {
    employee_technology: {
      include: {
        technologies: true;
      };
    };
    position: {
      select: {
        id: true;
        name: true;
        hourly_rate: true;
      };
    };
  };
}>;

export type SafeEmployee = Prisma.employeesGetPayload<{
  select: {
    id: true;
    first_name: true;
    last_name: true;
    busy_from: true;
    busy_to: true;
    status: true;

    employee_technology: {
      select: {
        technologies: true;
      };
    };

    position: {
      select: {
        id: true;
        name: true;
      };
    };
  };
}>;

// Formatted type for frontend (with employee_technology relation)
export type FormattedEmployee = Omit<EmployeeWithRelations, 'employee_technology'> & {
  technologies: Array<{ id: number; name: string }>;
  position: {
    id: number;
    name: string;
    hourly_rate: number | null;
  } | null;
};
