import { z } from 'zod';

const nullableNumberSchema = z.coerce
  .number()
  .nonnegative({ message: 'Wartość nie może być ujemna' })
  .transform((v) => (v === 0 ? null : v))
  .nullable()
  .optional();

export const serviceTemplateBaseSchema = z.object({
  id: z.string().cuid().optional(),

  name: z
    .string()
    .min(2, { message: 'Nazwa szablonu musi mieć min. 2 znaki' })
    .max(100, { message: 'Nazwa szablonu jest zbyt długa' }),

  description: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const newServiceTemplateSchema = serviceTemplateBaseSchema.omit({ id: true });

export const updateServiceTemplateSchema = serviceTemplateBaseSchema.extend({
  id: z.string().cuid({ message: 'Nieprawidłowe ID szablonu' }),
});

export const serviceTemplateResourceBaseSchema = z.object({
  id: z.string().cuid().optional(),

  label: z
    .string()
    .min(1, { message: 'Nazwa zasobu jest wymagana' })
    .max(200, { message: 'Nazwa jest zbyt długa' }),

  positionId: z.coerce
    .number()
    .int()
    .nonnegative()
    .transform((v) => (v === 0 ? null : v))
    .nullable()
    .optional(),

  unit: z.string().default('h'),

  estimated_quantity: nullableNumberSchema.refine(
    (val) => val === null || val === undefined || val < 1000,
    { message: 'Maksymalna ilość to 999.99' },
  ),

  price_override: nullableNumberSchema,
});

const resourceInFormSchema = serviceTemplateResourceBaseSchema;

export const createServiceTemplateWithResourcesSchema = newServiceTemplateSchema.extend({
  resources: z.array(resourceInFormSchema).optional().default([]),
});
export const updateServiceTemplateWithResourcesSchema = updateServiceTemplateSchema.extend({
  resources: z.array(resourceInFormSchema).optional().default([]),
});

export const deleteServiceTemplateSchema = z.object({
  id: z.string().cuid(),
});
export const deleteServiceTemplateResourceSchema = z.object({
  id: z.string().cuid(),
});
