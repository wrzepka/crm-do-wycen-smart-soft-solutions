import { z } from 'zod';
import {
  createServiceTemplateWithResourcesSchema,
  updateServiceTemplateWithResourcesSchema,
  deleteServiceTemplateSchema,
} from '@/lib/schemas/serviceSchema';

export type CreateServiceTemplateInput = z.infer<typeof createServiceTemplateWithResourcesSchema>;
export type UpdateServiceTemplateInput = z.infer<typeof updateServiceTemplateWithResourcesSchema>;
export type DeleteServiceTemplateInput = z.infer<typeof deleteServiceTemplateSchema>;
