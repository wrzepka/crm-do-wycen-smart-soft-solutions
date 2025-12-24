import { z } from 'zod';
import { positionSelectionSchema } from './positionSchema';
import { technologyIdsSchema } from './technologySchema';

// Employee status enum - possible states of an employee
export const EmployeeStatus = z.enum([
  'ACTIVE_AVAILABLE',
  'ACTIVE_BOOKED',
  'ON_LEAVE',
  'TERMINATED',
  'ONBOARDING',
]);

// Schema for technology selection in forms (used for validation)
export const technologySelectionSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
});

// Base schema for employee data validation
export const employeeBaseSchema = z.object({
  id: z.number().int().positive({ message: 'Nie poprawne ID pracownika' }),
  first_name: z
    .string()
    .min(1, { message: 'Imię nie może być puste' })
    .max(100, { message: 'Imię nie może przekraczać 100 znaków' }),
  last_name: z
    .string()
    .min(1, { message: 'Nazwisko nie może być puste' })
    .max(100, { message: 'Nazwisko nie może przekraczać 100 znaków' }),
  busy_from: z.date().nullable().optional(), // Start date of busy period (optional)
  busy_to: z.date().nullable().optional(), // End date of busy period (optional)
  // For interactive cell to update employee technologies - using imported schema
  technologyIds: technologyIdsSchema,
  status: EmployeeStatus.default('ACTIVE_AVAILABLE'), // Default status
  position_id: z
    .number()
    .int()
    .positive({ message: 'Nie poprawne ID stanowiska' })
    .nullable()
    .optional(), // Position reference
});

// Schema for creating a new employee (without ID)
export const newEmployeeSchema = employeeBaseSchema.omit({ id: true });

// Schema for updating an employee (partial update with ID required)
export const updateEmployeeSchema = employeeBaseSchema.partial().extend({
  id: z.number().int().positive(),
});

// Extended schema for employee with technologies relation
export const employeeWithTechnologiesSchema = employeeBaseSchema.extend({
  technologies: z.array(technologySelectionSchema),
  position: positionSelectionSchema.nullable().optional(),
});
