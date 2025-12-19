import { z } from 'zod';
import {
  employeeBaseSchema,
  newEmployeeSchema,
  updateEmployeeSchema,
} from '@/lib/schemas/employeeSchema';
import { Prisma } from '@/generated/prisma/client';

// -- Zod types --

// GET type
export type Employee = z.infer<typeof employeeBaseSchema>;

// DTO type for POST (new employee)
export type NewEmployeeDTO = z.infer<typeof newEmployeeSchema>;

// DTO type for PATCH (i guess) - update employee
export type UpdateEmployeeDTO = z.infer<typeof updateEmployeeSchema>;

// -- Prisma types --
// TODO: add the number of assigned projects
export type EmployeeWithRelations = Prisma.employeesGetPayload<{
  include: {
    employee_technology: {
      include: {
        technologies: true;
      };
    };
  };
}>;
