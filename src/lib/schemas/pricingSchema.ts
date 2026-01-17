import { z } from 'zod';

// Base schema for PricingService

export const pricingServiceBaseSchema = z.object({
  id: z.number().int().positive({ message: 'Nieprawidłowe ID usługi wyceny' }),
  name: z
    .string()
    .min(1, { message: 'Nazwa usługi nie może być pusta' })
    .max(200, { message: 'Nazwa usługi nie może przekraczać 200 znaków' }),
  description: z.string().nullable().optional(),
  net_price: z
    .union([
      z.string().min(1, { message: 'Cena netto jest wymagana' }),
      z.number().positive({ message: 'Cena netto musi być dodatnia' }),
    ])
    .transform((val) => {
      if (typeof val === 'string') {
        const parsed = parseFloat(val);
        return isNaN(parsed) ? null : parsed;
      }
      return val;
    })
    .refine((val) => val !== null && val > 0, {
      message: 'Cena netto musi być dodatnią liczbą',
    }),
  margin_amount: z
    .union([
      z.string(),
      z.number().min(0, { message: 'Marża nie może być ujemna' }),
      z.null(),
      z.undefined(),
    ])
    .transform((val) => {
      if (val === null || val === undefined || val === '') {
        return 0;
      }
      if (typeof val === 'string') {
        const parsed = parseFloat(val);
        return isNaN(parsed) ? 0 : parsed;
      }
      return val;
    })
    .default(0),
  discount_amount: z
    .union([z.string(), z.number().min(0, { message: 'Rabat nie może być ujemny' })])
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
  total_price: z
    .union([
      z.string().min(1, { message: 'Cena całkowita jest wymagana' }),
      z.number().positive({ message: 'Cena całkowita musi być dodatnia' }),
    ])
    .transform((val) => {
      if (typeof val === 'string') {
        const parsed = parseFloat(val);
        return isNaN(parsed) ? null : parsed;
      }
      return val;
    })
    .refine((val) => val !== null && val > 0, {
      message: 'Cena całkowita musi być dodatnią liczbą',
    }),
  pricingHistoryId: z
    .union([
      z.string().min(1, { message: 'ID wyceny jest wymagane' }),
      z.number().int().positive({ message: 'ID wyceny musi być dodatnią liczbą całkowitą' }),
    ])
    .transform((val) => {
      if (typeof val === 'string') {
        const parsed = parseInt(val);
        return isNaN(parsed) ? null : parsed;
      }
      return val;
    })
    .refine((val) => val !== null && val > 0, {
      message: 'ID wyceny musi być dodatnią liczbą całkowitą',
    }),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Schema for creating a new pricing service (without ID and timestamps)
export const newPricingServiceSchema = pricingServiceBaseSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Schema for updating a pricing service (partial update with ID required)
export const updatePricingServiceSchema = pricingServiceBaseSchema.partial().extend({
  id: z
    .union([
      z.string().min(1, { message: 'ID jest wymagane' }),
      z.number().int().positive({ message: 'ID musi być dodatnią liczbą całkowitą' }),
    ])
    .transform((val) => {
      if (typeof val === 'string') {
        const parsed = parseInt(val);
        return isNaN(parsed) ? null : parsed;
      }
      return val;
    })
    .refine((val) => val !== null && val > 0, {
      message: 'ID musi być dodatnią liczbą całkowitą',
    }),
});

// Schema for pricing service selection (used in dropdowns, forms, etc.)
export const pricingServiceSelectionSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  description: z.string().nullable(),
  net_price: z.number(),
  margin_amount: z.number(),
  discount_amount: z.number().nullable(),
  total_price: z.number(),
  pricingHistoryId: z.number().int().positive(),
});

// Schema for pricing service deletion
export const deletePricingServiceSchema = z.object({
  id: z.number().int().positive({ message: 'Nieprawidłowe ID usługi wyceny' }),
});

// Base schema for PricingServiceResource

export const pricingServiceResourceBaseSchema = z.object({
  id: z.number().int().positive({ message: 'Nieprawidłowe ID zasobu usługi' }),
  label: z
    .string()
    .min(1, { message: 'Etykieta zasobu nie może być pusta' })
    .max(200, { message: 'Etykieta zasobu nie może przekraczać 200 znaków' }),
  positionId: z
    .union([z.string(), z.number().int()])
    .transform((val) => {
      if (typeof val === 'string') {
        if (val === '') return null;
        const parsed = parseInt(val);
        return isNaN(parsed) || parsed <= 0 ? null : parsed;
      }
      return val <= 0 ? null : val;
    })
    .nullable()
    .optional(),
  unitPrice: z
    .union([
      z.string().min(1, { message: 'Cena jednostkowa jest wymagana' }),
      z.number().positive({ message: 'Cena jednostkowa musi być dodatnia' }),
    ])
    .transform((val) => {
      if (typeof val === 'string') {
        const parsed = parseFloat(val);
        return isNaN(parsed) ? null : parsed;
      }
      return val;
    })
    .refine((val) => val !== null && val > 0, {
      message: 'Cena jednostkowa musi być dodatnią liczbą',
    }),
  unit: z.string().default('h'),
  hours: z
    .union([
      z.string().min(1, { message: 'Liczba godzin jest wymagana' }),
      z.number().positive({ message: 'Liczba godzin musi być dodatnia' }),
    ])
    .transform((val) => {
      if (typeof val === 'string') {
        const parsed = parseFloat(val);
        return isNaN(parsed) ? null : parsed;
      }
      return val;
    })
    .refine((val) => val !== null && val > 0, {
      message: 'Liczba godzin musi być dodatnią liczbą',
    }),
  totalCost: z
    .union([z.string(), z.number().positive({ message: 'Koszt całkowity musi być dodatni' })])
    .transform((val) => {
      if (typeof val === 'string') {
        const parsed = parseFloat(val);
        return isNaN(parsed) ? null : parsed;
      }
      return val;
    })
    .refine((val) => val !== null && val > 0, {
      message: 'Koszt całkowity musi być dodatnią liczbą',
    }),
  pricingServiceId: z
    .union([
      z.string().min(1, { message: 'ID usługi jest wymagane' }),
      z.number().int().positive({ message: 'ID usługi musi być dodatnią liczbą całkowitą' }),
    ])
    .transform((val) => {
      if (typeof val === 'string') {
        const parsed = parseInt(val);
        return isNaN(parsed) ? null : parsed;
      }
      return val;
    })
    .refine((val) => val !== null && val > 0, {
      message: 'ID usługi musi być dodatnią liczbą całkowitą',
    }),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Schema for creating a new pricing service resource (without ID and timestamps)
export const newPricingServiceResourceSchema = pricingServiceResourceBaseSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Schema for updating a pricing service resource (partial update with ID required)
export const updatePricingServiceResourceSchema = pricingServiceResourceBaseSchema
  .partial()
  .extend({
    id: z
      .union([
        z.string().min(1, { message: 'ID jest wymagane' }),
        z.number().int().positive({ message: 'ID musi być dodatnią liczbą całkowitą' }),
      ])
      .transform((val) => {
        if (typeof val === 'string') {
          const parsed = parseInt(val);
          return isNaN(parsed) ? null : parsed;
        }
        return val;
      })
      .refine((val) => val !== null && val > 0, {
        message: 'ID musi być dodatnią liczbą całkowitą',
      }),
  });

// Schema for pricing service resource selection
export const pricingServiceResourceSelectionSchema = z.object({
  id: z.number().int().positive(),
  label: z.string(),
  positionId: z.number().int().positive().nullable(),
  unitPrice: z.number(),
  unit: z.string(),
  hours: z.number(),
  totalCost: z.number(),
  pricingServiceId: z.number().int().positive(),
});

// Schema for pricing service resource deletion
export const deletePricingServiceResourceSchema = z.object({
  id: z.number().int().positive({ message: 'Nieprawidłowe ID zasobu usługi' }),
});

export const createPricingServiceWithResourcesSchema = newPricingServiceSchema.extend({
  resources: z
    .array(newPricingServiceResourceSchema.omit({ pricingServiceId: true }))
    .optional()
    .default([]),
});

export const updatePricingServiceWithResourcesSchema = updatePricingServiceSchema.extend({
  resources: z
    .array(
      z.union([
        // New resource
        newPricingServiceResourceSchema.omit({ pricingServiceId: true }),
        // Existing resource
        updatePricingServiceResourceSchema,
      ]),
    )
    .optional()
    .default([]),
});

// TypeScript Types Export

export type PricingService = z.infer<typeof pricingServiceBaseSchema>;
export type NewPricingService = z.infer<typeof newPricingServiceSchema>;
export type UpdatePricingService = z.infer<typeof updatePricingServiceSchema>;
export type PricingServiceSelection = z.infer<typeof pricingServiceSelectionSchema>;

export type PricingServiceResource = z.infer<typeof pricingServiceResourceBaseSchema>;
export type NewPricingServiceResource = z.infer<typeof newPricingServiceResourceSchema>;
export type UpdatePricingServiceResource = z.infer<typeof updatePricingServiceResourceSchema>;
export type PricingServiceResourceSelection = z.infer<typeof pricingServiceResourceSelectionSchema>;

export type CreatePricingServiceWithResources = z.infer<
  typeof createPricingServiceWithResourcesSchema
>;
export type UpdatePricingServiceWithResources = z.infer<
  typeof updatePricingServiceWithResourcesSchema
>;
