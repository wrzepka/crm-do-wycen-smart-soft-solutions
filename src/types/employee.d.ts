import { z } from 'zod';
import {
  employeeBaseSchema,
  newEmployeeSchema,
  updateEmployeeSchema,
  employeeWithTechnologiesSchema,
} from '@/lib/schemas/employeeSchema';
import { Prisma } from '@/generated/prisma/client';

// -- Zod types --
export type Employee = z.infer<typeof employeeBaseSchema>;
export type NewEmployeeDTO = z.infer<typeof newEmployeeSchema>;
export type UpdateEmployeeDTO = z.infer<typeof updateEmployeeSchema>;
export type EmployeeWithTechnologies = z.infer<typeof employeeWithTechnologiesSchema>;

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

// Formatted type for frontend (with employee_technology relation)
export type FormattedEmployee = Omit<EmployeeWithRelations, 'employee_technology'> & {
  technologies: Array<{ id: number; name: string }>;
  position: {
    id: number;
    name: string;
    hourly_rate: number | null;
  } | null;
};
