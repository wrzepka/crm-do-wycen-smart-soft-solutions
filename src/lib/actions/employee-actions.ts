'use server';

import { revalidatePath } from 'next/cache';
import { newEmployeeSchema, updateEmployeeSchema } from '@/lib/schemas/employeeSchema';
import { prisma } from '@/lib/prisma-client';
import type { Prisma } from '@/generated/prisma/client';

// Helper function to parse FormData
function parseFormData(input: FormData | Record<string, unknown>) {
  if (!(input instanceof FormData)) {
    // Note: We assume JSON input does not update technologies (undefined) for simplicity.
    // To support JSON updates, check for technology_ids field here.
    return { data: input, technologyIds: undefined };
  }

  const formData = input;
  const data: Record<string, unknown> = {};
  const technologyIds: number[] = [];

  for (const [key, value] of formData.entries()) {
    // Handle multiple values for the same key (e.g. technology_ids[])
    if (key === 'technology_ids' || key.startsWith('technology_ids[')) {
      const numValue = Number(value);
      if (!isNaN(numValue) && numValue > 0) {
        technologyIds.push(numValue);
      }
    } else {
      data[key] = value;
    }
  }

  return {
    data,
    // FIXED: Return array (even empty) if input is FormData.
    // This signals updateEmployee to clear relations if needed.
    technologyIds,
  };
}

// Helper function for date conversion
function convertDateField(value: unknown): Date | null {
  if (value instanceof Date) return value;
  if (typeof value === 'string' && value.trim()) {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }
  return null;
}

export async function createEmployee(input: FormData | Record<string, unknown>) {
  try {
    const { data: payload, technologyIds } = parseFormData(input);

    // Date conversion
    if (payload.busy_from !== undefined) {
      payload.busy_from = convertDateField(payload.busy_from);
    }
    if (payload.busy_to !== undefined) {
      payload.busy_to = convertDateField(payload.busy_to);
    }

    // Validation (excluding technology_ids)
    const validationResult = newEmployeeSchema.safeParse(payload);
    if (!validationResult.success) {
      const errors = validationResult.error.flatten();
      return {
        ok: false,
        error: 'Błędy walidacji formularza', // You might want to translate error messages too
        fieldErrors: errors.fieldErrors,
        formErrors: errors.formErrors,
      };
    }

    const validData = validationResult.data;
    let createdId: number;

    await prisma.$transaction(async (tx) => {
      // Create employee
      const created = await tx.employees.create({
        data: {
          first_name: validData.first_name,
          last_name: validData.last_name,
          busy_from: validData.busy_from,
          busy_to: validData.busy_to,
          status: validData.status,
        },
        select: { id: true },
      });

      createdId = created.id;

      // Assign technologies if provided
      if (technologyIds && technologyIds.length > 0) {
        // Verify if technologies exist
        const existingTechs = await tx.technologies.findMany({
          where: { id: { in: technologyIds } },
          select: { id: true },
        });

        const existingIds = existingTechs.map((t) => t.id);
        const validTechIds = technologyIds.filter((id) => existingIds.includes(id));

        if (validTechIds.length > 0) {
          await tx.employee_technology.createMany({
            data: validTechIds.map((techId) => ({
              employee_id: created.id,
              technology_id: techId,
            })),
            skipDuplicates: true,
          });
        }
      }
    });

    revalidatePath('/dashboard/employees');
    return { ok: true, id: createdId! };
  } catch (err: unknown) {
    console.error('Create employee error:', err);
    const message = err instanceof Error ? err.message : 'Błąd podczas tworzenia pracownika';
    return { ok: false, error: message };
  }
}

export async function updateEmployee(
  id: number | string,
  input: FormData | Record<string, unknown>,
) {
  try {
    // Validate ID
    if (!id) throw new Error('Brak ID pracownika');

    const parsedId = typeof id === 'string' ? parseInt(id, 10) : id;
    if (Number.isNaN(parsedId)) throw new Error('Nieprawidłowe ID pracownika');

    const { data: payload, technologyIds } = parseFormData(input);

    // Date conversion
    if (payload.busy_from !== undefined) {
      payload.busy_from = convertDateField(payload.busy_from);
    }
    if (payload.busy_to !== undefined) {
      payload.busy_to = convertDateField(payload.busy_to);
    }

    // Validate employee data
    const dataWithId = { ...payload, id: parsedId };
    const validationResult = updateEmployeeSchema.safeParse(dataWithId);

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

    // LOGIC FIX:
    // If technologyIds is an array (even empty), !== undefined returns true.
    // If input was a regular object without technology_ids, it returns false (undefined).
    const hasTechnologyUpdates = technologyIds !== undefined;

    await prisma.$transaction(async (tx) => {
      // Check if employee exists
      const existingEmployee = await tx.employees.findUnique({
        where: { id: parsedId },
      });

      if (!existingEmployee) {
        throw new Error('Pracownik nie istnieje');
      }

      // Prepare update data with proper typing
      const updateData: Prisma.employeesUpdateInput = {};

      if (validData.first_name !== undefined) updateData.first_name = validData.first_name;
      if (validData.last_name !== undefined) updateData.last_name = validData.last_name;
      if (validData.busy_from !== undefined) updateData.busy_from = validData.busy_from;
      if (validData.busy_to !== undefined) updateData.busy_to = validData.busy_to;
      if (validData.status !== undefined) updateData.status = validData.status;

      // Check for changes in employee data
      const hasEmployeeUpdates = Object.keys(updateData).length > 0;

      if (!hasEmployeeUpdates && !hasTechnologyUpdates) {
        throw new Error('Nie podano żadnych pól do aktualizacji');
      }

      // Update employee data if there are changes
      if (hasEmployeeUpdates) {
        await tx.employees.update({
          where: { id: parsedId },
          data: updateData,
        });
      }

      // Update technologies if there are changes (including clearing)
      if (hasTechnologyUpdates) {
        // 1. Remove existing associations (clear the list for this employee)
        await tx.employee_technology.deleteMany({
          where: { employee_id: parsedId },
        });

        // 2. Add new ones (only if the array has elements)
        // If technologyIds is [], this block is skipped -> result: relations cleared.
        if (Array.isArray(technologyIds) && technologyIds.length > 0) {
          // Verify if technologies exist
          const existingTechs = await tx.technologies.findMany({
            where: { id: { in: technologyIds } },
            select: { id: true },
          });

          const existingIds = existingTechs.map((t) => t.id);
          const validTechIds = technologyIds.filter((id) => existingIds.includes(id));

          if (validTechIds.length > 0) {
            await tx.employee_technology.createMany({
              data: validTechIds.map((techId) => ({
                employee_id: parsedId,
                technology_id: techId,
              })),
              skipDuplicates: true,
            });
          }
        }
      }
    });

    revalidatePath('/dashboard/employees');
    return { ok: true, id: parsedId };
  } catch (err: unknown) {
    console.error('Update employee error:', err);
    const message = err instanceof Error ? err.message : 'Błąd podczas aktualizacji pracownika';
    return { ok: false, error: message };
  }
}

export async function getEmployeeWithTechnologies(id: number | string) {
  try {
    const parsedId = typeof id === 'string' ? parseInt(id, 10) : id;
    if (Number.isNaN(parsedId)) throw new Error('Nieprawidłowe ID pracownika');

    const employee = await prisma.employees.findUnique({
      where: { id: parsedId },
      include: {
        employee_technology: {
          include: {
            technologies: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!employee) {
      return {
        ok: false,
        error: 'Pracownik nie istnieje',
      };
    }

    // Format response
    const formattedEmployee = {
      ...employee,
      technologies: employee.employee_technology.map((et) => ({
        id: et.technologies.id,
        name: et.technologies.name,
      })),
    };

    return { ok: true, data: formattedEmployee };
  } catch (err: unknown) {
    console.error('Get employee error:', err);
    const message =
      err instanceof Error ? err.message : 'Błąd podczas pobierania danych pracownika';
    return { ok: false, error: message };
  }
}
