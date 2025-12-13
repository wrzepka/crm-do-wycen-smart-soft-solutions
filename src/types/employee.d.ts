import { z } from 'zod';
import {
  employeeBaseSchema,
  newEmployeeSchema,
  updateEmployeeSchema,
} from '@/lib/schemas/employeeSchema';

// GET type
export type Employee = z.infer<typeof employeeBaseSchema>;

// DTO type for POST (new employee)
export type NewEmployeeDTO = z.infer<typeof newEmployeeSchema>;

// DTO type for PATCH (i guess) - update employee
export type UpdateEmployeeDTO = z.infer<typeof updateEmployeeSchema>;
