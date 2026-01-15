import { z } from 'zod';

// Base schema for ServiceTemplate
export const serviceTemplateBaseSchema = z.object({
  id: z.string().cuid({ message: 'Nieprawidłowe ID szablonu usługi' }),
  name: z
    .string()
    .min(1, { message: 'Nazwa szablonu nie może być pusta' })
    .max(100, { message: 'Nazwa szablonu nie może przekraczać 100 znaków' }),
  description: z.string().nullable().optional(),
  defaultMargin: z
    .union([
      z.string().min(1, { message: 'Domyślna marża jest wymagana' }),
      z.number().int().min(0).max(100, { message: 'Marża musi być między 0 a 100' }),
    ])
    .transform((val) => {
      if (typeof val === 'string') {
        const parsed = parseInt(val);
        return isNaN(parsed) ? 20 : parsed;
      }
      return val;
    })
    .default(20),
  isActive: z.boolean().default(true),
});

// Schema for creating a new service template (without ID)
export const newServiceTemplateSchema = serviceTemplateBaseSchema.omit({ id: true });

// Schema for updating a service template (partial update with ID required)
export const updateServiceTemplateSchema = serviceTemplateBaseSchema.partial().extend({
  id: z.string().cuid({ message: 'Nieprawidłowe ID szablonu usługi' }),
});

// Schema for service template selection (used in dropdowns, forms, etc.)
export const serviceTemplateSelectionSchema = z.object({
  id: z.string().cuid(),
  name: z.string(),
  defaultMargin: z.number(),
  isActive: z.boolean(),
});

// Schema for service template deletion
export const deleteServiceTemplateSchema = z.object({
  id: z.string().cuid({ message: 'Nieprawidłowe ID szablonu usługi' }),
});

// Base schema for ServiceTemplateResource
export const serviceTemplateResourceBaseSchema = z.object({
  id: z.string().cuid({ message: 'Nieprawidłowe ID zasobu szablonu' }),
  label: z
    .string()
    .min(1, { message: 'Etykieta zasobu nie może być pusta' })
    .max(200, { message: 'Etykieta zasobu nie może przekraczać 200 znaków' }),
  positionId: z
    .union([
      z.string(),
      z.number().int().positive({ message: 'ID pozycji musi być dodatnią liczbą całkowitą' }),
    ])
    .transform((val) => {
      if (typeof val === 'string') {
        if (val === '' || val === null || val === undefined) return null;
        const parsed = parseInt(val);
        return isNaN(parsed) || parsed <= 0 ? null : parsed;
      }
      return val <= 0 ? null : val;
    })
    .nullable()
    .optional(),
  defaultUnitPrice: z
    .union([
      z.string(),
      z.number().positive({ message: 'Domyślna cena jednostkowa musi być dodatnia' }),
    ])
    .transform((val) => {
      if (typeof val === 'string') {
        if (val === '' || val === null || val === undefined) return null;
        const parsed = parseFloat(val);
        return isNaN(parsed) ? null : parsed;
      }
      return val;
    })
    .nullable()
    .optional(),
  unit: z.string().default('h'),
  estimatedHours: z
    .union([z.string(), z.number().positive({ message: 'Szacowane godziny muszą być dodatnie' })])
    .transform((val) => {
      if (typeof val === 'string') {
        if (val === '' || val === null || val === undefined) return null;
        const parsed = parseFloat(val);
        return isNaN(parsed) ? null : parsed;
      }
      return val;
    })
    .nullable()
    .optional(),
  serviceTemplateId: z.string().cuid({ message: 'ID szablonu usługi jest wymagane' }),
});

// Schema for creating a new service template resource (without ID)
export const newServiceTemplateResourceSchema = serviceTemplateResourceBaseSchema.omit({
  id: true,
});

// Schema for updating a service template resource (partial update with ID required)
export const updateServiceTemplateResourceSchema = serviceTemplateResourceBaseSchema
  .partial()
  .extend({
    id: z.string().cuid({ message: 'Nieprawidłowe ID zasobu szablonu' }),
  });

// Schema for service template resource selection
export const serviceTemplateResourceSelectionSchema = z.object({
  id: z.string().cuid(),
  label: z.string(),
  positionId: z.number().int().positive().nullable(),
  defaultUnitPrice: z.number().nullable(),
  unit: z.string(),
  estimatedHours: z.number().nullable(),
  serviceTemplateId: z.string().cuid(),
});

// Schema for service template resource deletion
export const deleteServiceTemplateResourceSchema = z.object({
  id: z.string().cuid({ message: 'Nieprawidłowe ID zasobu szablonu' }),
});

export const createServiceTemplateWithResourcesSchema = newServiceTemplateSchema.extend({
  resources: z
    .array(newServiceTemplateResourceSchema.omit({ serviceTemplateId: true }))
    .optional()
    .default([]),
});

export const updateServiceTemplateWithResourcesSchema = updateServiceTemplateSchema.extend({
  resources: z
    .array(
      z.union([
        // Case 2: New resource
        newServiceTemplateResourceSchema.omit({ serviceTemplateId: true }),

        // Case 2: Resource exists:
        updateServiceTemplateResourceSchema,
      ]),
    )
    .optional()
    .default([]),
});
