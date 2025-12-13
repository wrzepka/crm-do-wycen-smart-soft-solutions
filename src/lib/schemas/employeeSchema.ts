// src/lib/schemas/employeeSchema.ts
import { z } from 'zod';

export const EmployeeStatus = z.enum([
  'ACTIVE_AVAILABLE',
  'ACTIVE_BOOKED',
  'ON_LEAVE',
  'TERMINATED',
  'ONBOARDING',
]);

// Schema for technology selection in forms
export const technologySelectionSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
});

export const employeeBaseSchema = z.object({
  id: z.number().int().positive(),
  first_name: z
    .string()
    .min(1, { message: 'Imię nie może być puste' })
    .max(100, { message: 'Imię nie może przekraczać 100 znaków' }),
  last_name: z
    .string()
    .min(1, { message: 'Nazwisko nie może być puste' })
    .max(100, { message: 'Nazwisko nie może przekraczać 100 znaków' }),
  busy_from: z.date().nullable().optional(),
  busy_to: z.date().nullable().optional(),
  status: EmployeeStatus.default('ACTIVE_AVAILABLE'),
});

// --- New employee creation schema ---
export const newEmployeeSchema = employeeBaseSchema.omit({ id: true });

// --- Update employee schema --- (SIMPLIFIED - without technology_ids)
export const updateEmployeeSchema = employeeBaseSchema.partial().extend({
  id: z.number().int().positive(),
});

// Schema for employee list with technologies
export const employeeWithTechnologiesSchema = employeeBaseSchema.extend({
  technologies: z.array(technologySelectionSchema),
});
