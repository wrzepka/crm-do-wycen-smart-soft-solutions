import { z } from 'zod';
import {
  createServiceTemplateWithResourcesSchema,
  updateServiceTemplateWithResourcesSchema,
  newServiceTemplateResourceSchema,
  deleteServiceTemplateSchema,
} from '@/lib/schemas/serviceSchema';

export type CreateServiceTemplateInput = z.infer<typeof createServiceTemplateWithResourcesSchema>;
export type UpdateServiceTemplateInput = z.infer<typeof updateServiceTemplateWithResourcesSchema>;
export type NewResourceInput = z.infer<typeof newServiceTemplateResourceSchema>;
export type DeleteServiceTemplateInput = z.infer<typeof deleteServiceTemplateSchema>;
