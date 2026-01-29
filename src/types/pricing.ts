import { z } from 'zod';
import {
  createPricingHistoryWithServicesSchema,
  updatePricingHistoryWithServicesSchema,
  deletePricingHistorySchema,
} from '@/lib/schemas/pricingHistorySchema';
import {
  createPricingServiceWithResourcesSchema,
  updatePricingServiceWithResourcesSchema,
  deletePricingServiceSchema,
} from '@/lib/schemas/pricingSchema';

// Pricing History Types
export type CreatePricingHistoryInput = z.infer<typeof createPricingHistoryWithServicesSchema>;
export type UpdatePricingHistoryInput = z.infer<typeof updatePricingHistoryWithServicesSchema>;
export type DeletePricingHistoryInput = z.infer<typeof deletePricingHistorySchema>;

// Pricing Service Types
export type CreatePricingServiceInput = z.infer<typeof createPricingServiceWithResourcesSchema>;
export type UpdatePricingServiceInput = z.infer<typeof updatePricingServiceWithResourcesSchema>;
export type DeletePricingServiceInput = z.infer<typeof deletePricingServiceSchema>;
