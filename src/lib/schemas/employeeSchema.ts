import { z } from 'zod';

export const EmployeeStatus = z.enum([
  'ACTIVE_AVAILABLE', // Employee is active and available for new tasks/projects.
  'ACTIVE_BOOKED', // Employee is active but fully booked with current projects.
  'ON_LEAVE', // Employee is temporarily absent (vacation, sick leave, maternity).
  'TERMINATED', // Employment has been terminated.
  'ONBOARDING', // Employee is new and currently in the onboarding process (limited availability).
]);

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
  status: EmployeeStatus.default('ACTIVE_AVAILABLE'), // TODO: to change in future tftf
});

// --- New employee creation schema ---
// .omit({id: true}) is here to fix problem with passing id to the DB (database is using autoincrement for new rows)
export const newEmployeeSchema = employeeBaseSchema.omit({ id: true }).extend({
  // We expect that client will send array of integers.
  technology_ids: z.array(z.number().int().positive()).optional(), // We can add e.g min(1) if we need IDK
});

// --- Update employee schema ---
// partial() is here to make all fields optional. e.g. client wants only to update technology field.
export const updateEmployeeSchema = employeeBaseSchema.partial().extend({
  // inside the extend() method we are defining specific fields as obligatory.
  id: z.number().int().positive(),

  // Client can send us new list of technologies.
  technology_ids: z.array(z.number().int().positive()).optional(),
});
