'use server';

import { createServiceTemplateWithResourcesSchema } from '@/lib/schemas/serviceSchema';
import { CreateServiceTemplateInput } from '@/types/schemas';
import { prisma } from '@/lib/prisma-client';
import { revalidatePath } from 'next/cache';

export async function createServiceTemplate(data: CreateServiceTemplateInput) {
  const validation = createServiceTemplateWithResourcesSchema.safeParse(data);

  if (!validation.success) {
    const errors = validation.error.flatten();
    return {
      ok: false,
      error: 'Błędy walidacji formularza',
      fieldErrors: errors.fieldErrors,
      formErrors: errors.formErrors,
    };
  }

  const { name, description, defaultMargin, isActive, resources } = validation.data;

  try {
    await prisma.serviceTemplate.create({
      data: {
        name,
        description,
        defaultMargin,
        isActive,
        resources: {
          create:
            resources?.map((res) => ({
              label: res.label,
              unit: res.unit,
              estimatedHours: res.estimatedHours,
              defaultUnitPrice: res.defaultUnitPrice,
              positionId: res.positionId,
            })) || [],
        },
      },
    });

    revalidatePath('/dashboard/templates');
    return { ok: true, message: 'Szablon usługi został utworzony pomyślnie' };
  } catch (error) {
    console.error('Błąd tworzenia szablonu:', error);
    return { ok: false, error: 'Wystąpił błąd bazy danych.' };
  }
}
