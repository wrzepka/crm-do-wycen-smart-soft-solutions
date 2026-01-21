'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma-client';
import {
  createServiceTemplateWithResourcesSchema,
  updateServiceTemplateWithResourcesSchema,
  deleteServiceTemplateSchema,
} from '@/lib/schemas/serviceSchema';
import type {
  CreateServiceTemplateInput,
  UpdateServiceTemplateInput,
  DeleteServiceTemplateInput,
} from '@/types/services';

export async function createServiceTemplate(data: CreateServiceTemplateInput) {
  // TODO: Auth check

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

  const { resources, ...templateData } = validation.data;

  try {
    await prisma.serviceTemplate.create({
      data: {
        ...templateData,
        resources: {
          create: resources || [],
        },
      },
    });

    revalidatePath('/dashboard/templates');
    return { ok: true, message: 'Pomyślnie utworzono szablon.' };
  } catch (error) {
    console.error('Template create error:', error);
    return { ok: false, error: 'Wystąpił błąd podczas tworzenia szablonu.' };
  }
}

export async function updateServiceTemplate(data: UpdateServiceTemplateInput) {
  // TODO: Auth check

  const validation = updateServiceTemplateWithResourcesSchema.safeParse(data);

  if (!validation.success) {
    const errors = validation.error.flatten();
    return {
      ok: false,
      error: 'Błędy walidacji formularza',
      fieldErrors: errors.fieldErrors,
      formErrors: errors.formErrors,
    };
  }

  const { id: templateId, resources, ...templateData } = validation.data;

  try {
    await prisma.$transaction(async (tx) => {
      // Update main service template table
      await tx.serviceTemplate.update({
        where: { id: templateId },
        data: templateData,
      });

      const resourceIdsToKeep = resources.map((r) => r.id).filter((id): id is string => !!id);

      // Clean up sub services that are not listed in the form
      await tx.serviceTemplateResource.deleteMany({
        where: {
          serviceTemplateId: templateId,
          id: {
            notIn: resourceIdsToKeep,
          },
        },
      });

      // check every resource
      for (const res of resources) {
        if (res.id) {
          // Update existing service element
          await tx.serviceTemplateResource.update({
            where: { id: res.id },
            data: {
              label: res.label,
              unit: res.unit,
              positionId: res.positionId,
              estimated_quantity: res.estimated_quantity,
              price_override: res.price_override,
            },
          });
        } else {
          // Create new elements of service
          await tx.serviceTemplateResource.create({
            data: {
              serviceTemplateId: templateId,
              label: res.label,
              unit: res.unit,
              positionId: res.positionId,
              estimated_quantity: res.estimated_quantity,
              price_override: res.price_override,
            },
          });
        }
      }
    });

    revalidatePath('/dashboard/templates');
    return { ok: true, message: 'Pomyślnie zaktualizowano szablon.' };
  } catch (error) {
    console.error('Template update error:', error);
    return { ok: false, error: 'Wystąpił błąd podczas aktualizacji szablonu' };
  }
}

export async function deleteServiceTemplate(data: DeleteServiceTemplateInput) {
  // TODO: Auth check

  const validation = deleteServiceTemplateSchema.safeParse(data);

  if (!validation.success) {
    return { ok: false, error: 'Błędne ID szablonu' };
  }

  try {
    // It will also delete resources (OnDelete: Cascade)
    await prisma.serviceTemplate.delete({
      where: { id: validation.data.id },
    });

    revalidatePath('/dashboard/templates');
    return { ok: true, message: 'Pomyślnie usunięto szablon.' };
  } catch (error) {
    console.error('Template delete error:', error);
    return { ok: false, error: 'Wystąpił błąd podczas usuwania szablonu' };
  }
}
