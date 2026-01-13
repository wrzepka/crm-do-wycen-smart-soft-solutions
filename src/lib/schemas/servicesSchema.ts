import { z } from 'zod';

// Base schema for service (combines projects and project_details models)
export const serviceBaseSchema = z.object({
  // Project (projects) fields
  client_id: z.coerce
    .number()
    .int()
    .positive({ message: 'ID klienta musi być dodatnią liczbą całkowitą' }),

  employee_id: z
    .union([z.string(), z.number()])
    .transform((val) => {
      if (val === '' || val === null || val === undefined) return null;
      const num = Number(val);
      return isNaN(num) || num <= 0 ? null : num;
    })
    .nullable()
    .optional(),

  // Project details (project_details) fields
  project_name: z
    .string()
    .min(1, { message: 'Nazwa projektu nie może być pusta' })
    .max(200, { message: 'Nazwa projektu nie może przekraczać 200 znaków' }),

  description: z
    .string()
    .max(1000, { message: 'Opis nie może przekraczać 1000 znaków' })
    .nullable()
    .optional()
    .or(z.literal('')),

  technologies: z
    .string()
    .max(500, { message: 'Technologie nie mogą przekraczać 500 znaków' })
    .nullable()
    .optional()
    .or(z.literal('')),

  estimated_hours: z
    .preprocess(
      (val) => {
        if (val === '' || val === null || val === undefined) return null;
        const num = Number(val);
        return isNaN(num) ? null : num;
      },
      z
        .number()
        .positive({ message: 'Szacowane godziny muszą być dodatnie' })
        .nullable()
        .optional(),
    )
    .refine((val) => val === null || val > 0, {
      message: 'Szacowane godziny muszą być dodatnie',
    }),

  estimated_price: z
    .preprocess(
      (val) => {
        if (val === '' || val === null || val === undefined) return null;
        const num = Number(val);
        return isNaN(num) ? null : num;
      },
      z.number().positive({ message: 'Szacowana cena musi być dodatnia' }).nullable().optional(),
    )
    .refine((val) => val === null || val > 0, {
      message: 'Szacowana cena musi być dodatnia',
    }),

  status: z
    .string()
    .max(50, { message: 'Status nie może przekraczać 50 znaków' })
    .optional()
    .nullable()
    .default('new'),

  start_date: z
    .union([z.string(), z.date()])
    .transform((val) => {
      if (!val) return null;
      if (val instanceof Date) return val;
      if (val === '') return null;
      const date = new Date(val);
      return isNaN(date.getTime()) ? null : date;
    })
    .nullable()
    .optional(),

  end_date: z
    .union([z.string(), z.date()])
    .transform((val) => {
      if (!val) return null;
      if (val instanceof Date) return val;
      if (val === '') return null;
      const date = new Date(val);
      return isNaN(date.getTime()) ? null : date;
    })
    .nullable()
    .optional(),
});

// Schema for creating a new service (without ID)
export const newServiceSchema = serviceBaseSchema;

// Schema for updating a service (partial update with ID required)
export const updateServiceSchema = serviceBaseSchema.partial().extend({
  id: z.coerce
    .number()
    .int()
    .positive({ message: 'ID projektu musi być dodatnią liczbą całkowitą' }),
});

// Schema for service selection (used in dropdowns, forms, etc.)
export const serviceSelectionSchema = z.object({
  id: z.number().int().positive(),
  project_name: z.string(),
  client_id: z.number().int().positive(),
  employee_id: z.number().int().positive().nullable(),
  status: z.string(),
  start_date: z.date().nullable(),
  end_date: z.date().nullable(),
});

// Schema for validating an array of service IDs (optional, for bulk operations)
export const serviceIdsSchema = z
  .array(
    z.coerce.number().int().positive({ message: 'ID usługi musi być dodatnią liczbą całkowitą' }),
  )
  .optional();

// Schema for service deletion
export const deleteServiceSchema = z.object({
  id: z.coerce
    .number()
    .int()
    .positive({ message: 'ID projektu musi być dodatnią liczbą całkowitą' }),
});

// TypeScript types inference
export type ServiceBase = z.infer<typeof serviceBaseSchema>;
export type NewService = z.infer<typeof newServiceSchema>;
export type UpdateService = z.infer<typeof updateServiceSchema>;
export type ServiceSelection = z.infer<typeof serviceSelectionSchema>;
export type DeleteService = z.infer<typeof deleteServiceSchema>;
