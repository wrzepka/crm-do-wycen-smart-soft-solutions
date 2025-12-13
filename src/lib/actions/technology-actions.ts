// src/lib/actions/technology-actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import {
  newTechnologySchema,
  updateTechnologySchema,
  technologyIdsSchema,
} from '@/lib/schemas/technologySchema';
import { prisma } from '@/lib/prisma-client';

/**
 * Pobierz wszystkie technologie
 */
export async function getAllTechnologies() {
  try {
    const technologies = await prisma.technologies.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            employee_technology: true,
          },
        },
      },
    });

    return { ok: true, data: technologies };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Błąd podczas pobierania technologii';
    return { ok: false, error: message };
  }
}

/**
 * Stwórz nową technologię
 */
export async function createTechnology(input: FormData | Record<string, unknown>) {
  try {
    // Konwertuj input na obiekt
    const payload: Record<string, unknown> =
      input instanceof FormData
        ? Object.fromEntries(input.entries())
        : (input as Record<string, unknown>);

    // Walidacja danych
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

    // Sprawdź, czy technologia o tej nazwie już istnieje
    const existingTechnology = await prisma.technologies.findUnique({
      where: { name: validData.name },
    });

    if (existingTechnology) {
      return {
        ok: false,
        error: 'Technologia o tej nazwie już istnieje',
      };
    }

    // Stwórz technologię
    const created = await prisma.technologies.create({
      data: {
        name: validData.name,
      },
      select: { id: true, name: true },
    });

    // Odśwież cache
    revalidatePath('/dashboard/technologies');
    revalidatePath('/dashboard/employees');

    return { ok: true, data: created };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Błąd podczas tworzenia technologii';
    return { ok: false, error: message };
  }
}

/**
 * Aktualizuj technologię
 */
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

    // Sprawdź, czy technologia istnieje
    const existingTechnology = await prisma.technologies.findUnique({
      where: { id: parsedId },
    });

    if (!existingTechnology) {
      return {
        ok: false,
        error: 'Technologia nie istnieje',
      };
    }

    // Jeśli zmienia się nazwa, sprawdź czy nowa nazwa nie jest już zajęta
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

    // Przygotuj dane do aktualizacji - użyj Record zamiast Prisma.technologiesUpdateInput
    const updateData: Record<string, unknown> = {};
    if (validData.name !== undefined) updateData.name = validData.name;

    if (Object.keys(updateData).length === 0) {
      throw new Error('Nie podano żadnych pól do aktualizacji');
    }

    // Wykonaj aktualizację
    const updated = await prisma.technologies.update({
      where: { id: parsedId },
      data: updateData,
      select: { id: true, name: true },
    });

    // Odśwież cache
    revalidatePath('/dashboard/technologies');
    revalidatePath('/dashboard/employees');

    return { ok: true, data: updated };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Błąd podczas aktualizacji technologii';
    return { ok: false, error: message };
  }
}

/**
 * Usuń technologię
 */
export async function deleteTechnology(id: number | string) {
  try {
    if (!id) throw new Error('Brak ID technologii');

    const parsedId = typeof id === 'string' ? parseInt(id, 10) : id;
    if (Number.isNaN(parsedId)) throw new Error('Nieprawidłowe ID technologii');

    // Sprawdź, czy technologia jest przypisana do jakiegoś pracownika
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

    // Usuń technologię
    await prisma.technologies.delete({
      where: { id: parsedId },
    });

    // Odśwież cache
    revalidatePath('/dashboard/technologies');
    revalidatePath('/dashboard/employees');

    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Błąd podczas usuwania technologii';
    return { ok: false, error: message };
  }
}

/**
 * Funkcja pomocnicza do zarządzania technologiami pracownika
 */
export async function setEmployeeTechnologies(employeeId: number, technologyIds: number[]) {
  try {
    // Walidacja ID technologii
    const validationResult = technologyIdsSchema.safeParse(technologyIds);
    if (!validationResult.success) {
      const errors = validationResult.error.flatten();
      return {
        ok: false,
        error: 'Nieprawidłowe ID technologii',
        fieldErrors: errors.fieldErrors,
      };
    }

    // Użyj transakcji, aby zapewnić atomowość operacji
    await prisma.$transaction(async (tx) => {
      // 1. Usuń istniejące powiązania
      await tx.employee_technology.deleteMany({
        where: { employee_id: employeeId },
      });

      // 2. Stwórz nowe powiązania (jeśli są technologie)
      if (technologyIds && technologyIds.length > 0) {
        // Sprawdź, czy wszystkie technologie istnieją
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

        // Stwórz nowe powiązania
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

/**
 * Pobierz technologie przypisane do pracownika
 */
export async function getEmployeeTechnologies(employeeId: number | string) {
  try {
    const parsedId = typeof employeeId === 'string' ? parseInt(employeeId, 10) : employeeId;

    if (Number.isNaN(parsedId)) {
      throw new Error('Nieprawidłowe ID pracownika');
    }

    const technologies = await prisma.employee_technology.findMany({
      where: { employee_id: parsedId },
      include: {
        technologies: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        technologies: {
          name: 'asc',
        },
      },
    });

    // Przekształć dane do łatwiejszego formatu
    const formattedTechnologies = technologies.map((et) => ({
      id: et.technologies.id,
      name: et.technologies.name,
    }));

    return { ok: true, data: formattedTechnologies };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Błąd podczas pobierania technologii pracownika';
    return { ok: false, error: message };
  }
}
