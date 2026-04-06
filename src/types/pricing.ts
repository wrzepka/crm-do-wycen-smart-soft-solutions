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

// export all pricing history types
export type { QuoteStatus } from '@/lib/schemas/pricingHistorySchema';
export type { PricingHistory } from '@/lib/schemas/pricingHistorySchema';
export type { NewPricingHistory } from '@/lib/schemas/pricingHistorySchema';
export type { UpdatePricingHistory } from '@/lib/schemas/pricingHistorySchema';
export type { CreatePricingHistoryWithServices } from '@/lib/schemas/pricingHistorySchema';
export type { UpdatePricingHistoryWithServices } from '@/lib/schemas/pricingHistorySchema';
export type { PricingHistoryStatusUpdate } from '@/lib/schemas/pricingHistorySchema';
export type { DeletePricingHistory } from '@/lib/schemas/pricingHistorySchema';

// export all pricing service types
export type { PricingService } from '@/lib/schemas/pricingSchema';
export type { NewPricingService } from '@/lib/schemas/pricingSchema';
export type { UpdatePricingService } from '@/lib/schemas/pricingSchema';
export type { PricingServiceSelection } from '@/lib/schemas/pricingSchema';
export type { PricingServiceResource } from '@/lib/schemas/pricingSchema';
export type { NewPricingServiceResource } from '@/lib/schemas/pricingSchema';
export type { UpdatePricingServiceResource } from '@/lib/schemas/pricingSchema';
export type { PricingServiceResourceSelection } from '@/lib/schemas/pricingSchema';
export type { CreatePricingServiceWithResources } from '@/lib/schemas/pricingSchema';
export type { UpdatePricingServiceWithResources } from '@/lib/schemas/pricingSchema';

// additional service types for inputs
export type CreatePricingHistoryInput = z.infer<typeof createPricingHistoryWithServicesSchema>;
export type UpdatePricingHistoryInput = z.infer<typeof updatePricingHistoryWithServicesSchema>;
export type DeletePricingHistoryInput = z.infer<typeof deletePricingHistorySchema>;

export type CreatePricingServiceInput = z.infer<typeof createPricingServiceWithResourcesSchema>;
export type UpdatePricingServiceInput = z.infer<typeof updatePricingServiceWithResourcesSchema>;
export type DeletePricingServiceInput = z.infer<typeof deletePricingServiceSchema>;
