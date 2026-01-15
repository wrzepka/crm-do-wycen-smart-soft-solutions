'use server';

import {
  createServiceTemplateWithResourcesSchema,
  updateServiceTemplateWithResourcesSchema,
} from '@/lib/schemas/serviceSchema';
import {
  CreateServiceTemplateInput,
  UpdateServiceTemplateInput,
  NewResourceInput,
} from '@/types/schemas';
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
    return { ok: true, message: 'Szablon usługi został utworzony pomyślnie.' };
  } catch (error) {
    console.error('Template create error:', error);
    return { ok: false, error: 'Wystąpił błąd podczas tworzenia schematu.' };
  }
}

export async function updateServiceTemplate(data: UpdateServiceTemplateInput) {
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
      // Update main record from serviceTemplate table
      await tx.serviceTemplate.update({
        where: {
          id: templateId,
        },
        data: templateData,
      });

      // Resources:
      const resourceIdsToKeep = resources
        .filter((r) => 'id' in r && r.id) // check if object contains id (Type Guard)
        .map((r) => (r as { id: string }).id);

      // Delete resources positions from table that are not listed in input data.
      await tx.serviceTemplateResource.deleteMany({
        where: {
          serviceTemplateId: templateId,
          id: {
            notIn: resourceIdsToKeep,
          },
        },
      });

      // Update resources. If row is already in table, update that row, otherwise create new resource position
      for (const resource of resources) {
        if ('id' in resource && resource.id) {
          // id exists, so update that row
          const { id: resourceId, ...resourceData } = resource;

          await tx.serviceTemplateResource.update({
            where: {
              id: resourceId,
            },
            data: resourceData,
          });
        } else {
          // create new row
          const newResource = resource as NewResourceInput; // type cast, to inform TS, that data is valid and safe

          await tx.serviceTemplateResource.create({
            data: {
              ...newResource,
              serviceTemplateId: templateId,
            },
          });
        }
      }
    });

    revalidatePath('/dashboard/templates');

    return { ok: true, message: 'Pomyślnie zaktualizowano szablon.' };
  } catch (error) {
    console.error('Template update error:', error);
    return { ok: false, error: 'Wystąpił błąd podczas aktualizacji schematu' };
  }
}
