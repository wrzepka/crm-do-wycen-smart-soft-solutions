import { z } from 'zod';
import { createServiceTemplateWithResourcesSchema } from '@/lib/schemas/serviceSchema';

export type CreateServiceTemplateInput = z.infer<typeof createServiceTemplateWithResourcesSchema>;
