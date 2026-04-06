'use server';

import { revalidatePath } from 'next/cache';
import {
  newTechnologySchema,
  updateTechnologySchema,
  technologyIdsSchema,
} from '@/lib/schemas/technologySchema';
import { prisma } from '@/lib/prisma-client';

// create technology
export async function createTechnology(input: FormData | Record<string, unknown>) {
  try {
    // convert FormData to object if necessary
    const payload: Record<string, unknown> =
      input instanceof FormData
        ? Object.fromEntries(input.entries())
        : (input as Record<string, unknown>);

    // validate input
    const validationResult = newTechnologySchema.safeParse(payload);

    if (!validationResult.success) {
      const errors = validationResult.error.flatten();
      return {
        ok: false,
        error: 'Błędy walidacji formularza',
        fieldErrors: errors.fieldErrors,
        formErrors: errors.formErrors,
      };
    }

    const validData = validationResult.data;

    // check if technology with the same name already exists
    const existingTechnology = await prisma.technologies.findUnique({
      where: { name: validData.name },
    });

    if (existingTechnology) {
      return {
        ok: false,
        error: 'Technologia o tej nazwie już istnieje',
      };
    }

    // create technology
    const created = await prisma.technologies.create({
      data: {
        name: validData.name,
      },
      select: { id: true, name: true },
    });

    // refresh cache
    revalidatePath('/dashboard/technologies');
    revalidatePath('/dashboard/employees');

    return { ok: true, data: created };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Błąd podczas tworzenia technologii';
    return { ok: false, error: message };
  }
}

// update technology
export async function updateTechnology(
  id: number | string,
  input: FormData | Record<string, unknown>,
) {
  try {
    if (!id) throw new Error('Brak ID technologii');

    const parsedId = typeof id === 'string' ? parseInt(id, 10) : id;
    if (Number.isNaN(parsedId)) throw new Error('Nieprawidłowe ID technologii');

    const payload: Record<string, unknown> =
      input instanceof FormData
        ? Object.fromEntries(input.entries())
        : (input as Record<string, unknown>);

    const dataWithId = { ...payload, id: parsedId };
    const validationResult = updateTechnologySchema.safeParse(dataWithId);

    if (!validationResult.success) {
      const errors = validationResult.error.flatten();
      return {
        ok: false,
        error: 'Błędy walidacji formularza',
        fieldErrors: errors.fieldErrors,
        formErrors: errors.formErrors,
      };
    }

    const validData = validationResult.data;

    // check if technology exists
    const existingTechnology = await prisma.technologies.findUnique({
      where: { id: parsedId },
    });

    if (!existingTechnology) {
      return {
        ok: false,
        error: 'Technologia nie istnieje',
      };
    }

    // check if name is being updated and if it already exists
    if (validData.name && validData.name !== existingTechnology.name) {
      const technologyWithSameName = await prisma.technologies.findUnique({
        where: { name: validData.name },
      });

      if (technologyWithSameName) {
        return {
          ok: false,
          error: 'Technologia o tej nazwie już istnieje',
        };
      }
    }

    // prepare update data
    const updateData: Record<string, unknown> = {};
    if (validData.name !== undefined) updateData.name = validData.name;

    if (Object.keys(updateData).length === 0) {
      throw new Error('Nie podano żadnych pól do aktualizacji');
    }

    // update technology
    const updated = await prisma.technologies.update({
      where: { id: parsedId },
      data: updateData,
      select: { id: true, name: true },
    });

    // refresh cache
    revalidatePath('/dashboard/technologies');
    revalidatePath('/dashboard/employees');

    return { ok: true, data: updated };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Błąd podczas aktualizacji technologii';
    return { ok: false, error: message };
  }
}

//delete technology
export async function deleteTechnology(id: number | string) {
  try {
    if (!id) throw new Error('Brak ID technologii');

    const parsedId = typeof id === 'string' ? parseInt(id, 10) : id;
    if (Number.isNaN(parsedId)) throw new Error('Nieprawidłowe ID technologii');

    // check if technology exists and if it is assigned to any employee
    const technologyWithEmployees = await prisma.technologies.findUnique({
      where: { id: parsedId },
      include: {
        employee_technology: {
          take: 1,
        },
      },
    });

    if (!technologyWithEmployees) {
      return {
        ok: false,
        error: 'Technologia nie istnieje',
      };
    }

    if (technologyWithEmployees.employee_technology.length > 0) {
      return {
        ok: false,
        error: 'Nie można usunąć technologii przypisanej do pracowników',
      };
    }

    // delete technology
    await prisma.technologies.delete({
      where: { id: parsedId },
    });

    // refresh cache
    revalidatePath('/dashboard/technologies');
    revalidatePath('/dashboard/employees');

    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Błąd podczas usuwania technologii';
    return { ok: false, error: message };
  }
}

//helper function to set employee technologies
export async function setEmployeeTechnologies(employeeId: number, technologyIds: number[]) {
  try {
    // Validate technologyIds using zod schema
    const validationResult = technologyIdsSchema.safeParse(technologyIds);
    if (!validationResult.success) {
      const errors = validationResult.error.flatten();
      return {
        ok: false,
        error: 'Nieprawidłowe ID technologii',
        fieldErrors: errors.fieldErrors,
      };
    }

    // use transaction to ensure atomicity of delete and create operations
    await prisma.$transaction(async (tx) => {
      // delete existing relations for the employee
      await tx.employee_technology.deleteMany({
        where: { employee_id: employeeId },
      });

      // create new relations if technologyIds is not empty
      if (technologyIds && technologyIds.length > 0) {
        // check if all provided technology IDs exist
        const existingTechnologies = await tx.technologies.findMany({
          where: {
            id: { in: technologyIds },
          },
          select: { id: true },
        });

        const existingIds = existingTechnologies.map((t) => t.id);
        const missingIds = technologyIds.filter((id) => !existingIds.includes(id));

        if (missingIds.length > 0) {
          throw new Error(`Niektóre technologie nie istnieją: ${missingIds.join(', ')}`);
        }

        // create new relations
        await tx.employee_technology.createMany({
          data: technologyIds.map((technologyId) => ({
            employee_id: employeeId,
            technology_id: technologyId,
          })),
          skipDuplicates: true,
        });
      }
    });

    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Błąd podczas przypisywania technologii';
    return { ok: false, error: message };
  }
}
