import { z } from 'zod';
import {
  createPricingServiceWithResourcesSchema,
  updatePricingServiceWithResourcesSchema,
} from './pricingSchema';

// Enum for QuoteStatus
export const QuoteStatusEnum = z.enum(['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'CANCELLED']);

// Base schema for PricingHistory
export const pricingHistoryBaseSchema = z.object({
  id: z.number().int().positive({ message: 'Nieprawidłowe ID wyceny' }),
  client_id: z.number().int().positive({ message: 'ID klienta jest wymagane' }),
  project_id: z.number().int().positive().nullable().optional(),
  version: z.number().int().positive().default(1),
  is_current_version: z.boolean().default(true),
  quote_date: z.date(),
  quote_code: z
    .string()
    .nullable()
    .optional()
    .refine((val) => !val || /^[A-Z0-9/\-v]{3,50}$/.test(val), {
      message: 'Nieprawidłowy format numeru oferty',
    }),
  subtotal_net: z
    .union([z.string(), z.number()])
    .transform((val) => {
      if (typeof val === 'string') {
        const parsed = parseFloat(val);
        return isNaN(parsed) ? 0 : parsed;
      }
      return val;
    })
    .default(0),
  discount: z
    .union([z.string(), z.number()])
    .transform((val) => {
      if (typeof val === 'string') {
        const parsed = parseFloat(val);
        return isNaN(parsed) ? 0 : parsed;
      }
      return val;
    })
    .default(0),
  total_net: z
    .union([z.string(), z.number()])
    .transform((val) => {
      if (typeof val === 'string') {
        const parsed = parseFloat(val);
        return isNaN(parsed) ? 0 : parsed;
      }
      return val;
    })
    .default(0),
  vat_rate: z
    .union([z.string(), z.number()])
    .transform((val) => {
      if (typeof val === 'string') {
        const parsed = parseInt(val);
        return isNaN(parsed) ? 23 : parsed;
      }
      return val;
    })
    .refine((val) => val >= 0 && val <= 100, {
      message: 'Stawka VAT musi być w zakresie 0-100%',
    })
    .default(23),
  total_gross: z
    .union([z.string(), z.number()])
    .transform((val) => {
      if (typeof val === 'string') {
        const parsed = parseFloat(val);
        return isNaN(parsed) ? 0 : parsed;
      }
      return val;
    })
    .default(0),
  total_cost: z
    .union([z.string(), z.number()])
    .transform((val) => {
      if (typeof val === 'string') {
        const parsed = parseFloat(val);
        return isNaN(parsed) ? 0 : parsed;
      }
      return val;
    })
    .default(0),
  currency: z.string().min(3).max(3).default('PLN'),
  status: QuoteStatusEnum.default('DRAFT'),
  notes: z.string().nullable().optional(),
  previousVersionId: z.number().int().positive().nullable().optional(),
});

// Schema for creating a new pricing history
// [CHANGED] Removed `quote_date` and calculated totals (subtotal_net, total_net, etc.) from `omit`.
// REASON: The frontend calculates these values live and sends them to the backend.
// Excluding them here caused validation errors because the received payload contained "unknown" fields (in strict mode) or missing required fields.
export const newPricingHistorySchema = pricingHistoryBaseSchema.omit({
  id: true,
  // quote_date: true, // ALLOWED: User can select a custom date
  quote_code: true,
  // subtotal_net: true, // ALLOWED: Sent from frontend calculations
  // total_net: true,
  // total_gross: true,
  // total_cost: true,
});

// Schema for updating a pricing history (partial update with ID required)
export const updatePricingHistorySchema = pricingHistoryBaseSchema.partial().extend({
  id: z.number().int().positive({ message: 'ID wyceny jest wymagane' }),
});

// Schema for creating pricing history with services
export const createPricingHistoryWithServicesSchema = newPricingHistorySchema.extend({
  services: z.array(createPricingServiceWithResourcesSchema).min(1, {
    message: 'Wycena musi zawierać co najmniej jedną usługę',
  }),
  vat_rate: z.union([z.string(), z.number()]).optional().default(23),
  discount: z.union([z.string(), z.number()]).optional().default(0),
});

// Schema for updating pricing history with services
// [CHANGED] Using `z.union` for the `services` array validation.
// REASON: During an edit session, the `services` array can contain two types of items:
// 1. Existing services (which have an ID and must adhere to `updatePricingServiceWithResourcesSchema`).
// 2. New services added during the edit (which have no ID or `id: null` and must adhere to `createPricingServiceWithResourcesSchema`).
// Without `z.union`, adding a new service during an update would fail validation because it lacks an ID.
export const updatePricingHistoryWithServicesSchema = updatePricingHistorySchema.extend({
  services: z.array(
    z.union([
      // Case A: Existing service (has ID) -> Use Update Schema
      updatePricingServiceWithResourcesSchema,

      // Case B: New service added during edit (no ID or ID is null) -> Use Create Schema
      // We extend the create schema to explicitly allow `id` and `pricingHistoryId` to be optional/null,
      // preventing validation errors when the frontend sends these fields as null placeholders.
      createPricingServiceWithResourcesSchema.extend({
        id: z.union([z.number(), z.null(), z.undefined()]).optional(),
        pricingHistoryId: z.union([z.number(), z.null(), z.undefined()]).optional(),
      })
    ])
  ).min(1, {
    message: 'Wycena musi zawierać co najmniej jedną usługę',
  }),
});

// Status-specific update schemas
export const draftPricingHistorySchema = z.object({
  id: z.number().int().positive(),
  status: z.literal('DRAFT'),
  notes: z.string().optional(),
});

export const sentPricingHistorySchema = z.object({
  id: z.number().int().positive(),
  status: z.literal('SENT'),
});

export const acceptedPricingHistorySchema = z.object({
  id: z.number().int().positive(),
  status: z.literal('ACCEPTED'),
});

export const rejectedPricingHistorySchema = z.object({
  id: z.number().int().positive(),
  status: z.literal('REJECTED'),
  notes: z.string().optional(),
});

export const cancelledPricingHistorySchema = z.object({
  id: z.number().int().positive(),
  status: z.literal('CANCELLED'),
  notes: z.string().optional(),
});

// Schema for deleting pricing history
export const deletePricingHistorySchema = z.object({
  id: z.number().int().positive({ message: 'Nieprawidłowe ID wyceny' }),
});

// TypeScript Types Export
export type QuoteStatus = z.infer<typeof QuoteStatusEnum>;
export type PricingHistory = z.infer<typeof pricingHistoryBaseSchema>;
export type NewPricingHistory = z.infer<typeof newPricingHistorySchema>;
export type UpdatePricingHistory = z.infer<typeof updatePricingHistorySchema>;
export type CreatePricingHistoryWithServices = z.infer<
  typeof createPricingHistoryWithServicesSchema
>;
export type UpdatePricingHistoryWithServices = z.infer<
  typeof updatePricingHistoryWithServicesSchema
>;
export type PricingHistoryStatusUpdate =
  | z.infer<typeof draftPricingHistorySchema>
  | z.infer<typeof sentPricingHistorySchema>
  | z.infer<typeof acceptedPricingHistorySchema>
  | z.infer<typeof rejectedPricingHistorySchema>
  | z.infer<typeof cancelledPricingHistorySchema>;
export type DeletePricingHistory = z.infer<typeof deletePricingHistorySchema>;