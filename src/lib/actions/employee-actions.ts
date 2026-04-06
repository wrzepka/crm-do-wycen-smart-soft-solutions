'use server';

import { revalidatePath } from 'next/cache';
import { newEmployeeSchema, updateEmployeeSchema } from '@/lib/schemas/employeeSchema';
import { prisma } from '@/lib/prisma-client';
import type { Prisma } from '@/generated/prisma/client';
import { setEmployeeTechnologies } from '@/lib/actions/technology-actions';

// Helper function to parse FormData or Record input for employee actions
function parseFormData(input: FormData | Record<string, unknown>) {
  if (!(input instanceof FormData)) {
    // For JSON input, return as-is (assumes no technology updates)
    return { data: input, technologyIds: undefined, positionId: undefined };
  }

  const formData = input;
  const data: Record<string, unknown> = {};
  const technologyIds: number[] = [];
  // positionId can be number, null (to clear), or undefined (no change)
  let positionId: number | null | undefined = undefined;

  // Iterate through FormData entries
  for (const [key, value] of formData.entries()) {
    // Handle technology_ids (can be array with brackets or repeated keys)
    if (key === 'technology_ids' || key.startsWith('technology_ids[')) {
      const numValue = Number(value);
      if (!isNaN(numValue) && numValue > 0) {
        technologyIds.push(numValue);
      }
    }
    // Handle position_id (can be empty/null)
    else if (key === 'position_id') {
      if (value === '' || value === 'null' || value === null) {
        positionId = null;
      } else {
        const numValue = Number(value);
        if (!isNaN(numValue) && numValue > 0) {
          positionId = numValue;
        }
      }
    } else {
      data[key] = value;
    }
  }

  return {
    data,
    // Return array (even empty) for FormData input
    // This signals updateEmployee to clear relations if needed
    technologyIds,
    positionId,
  };
}

// Helper function to convert date fields from string to Date object
function convertDateField(value: unknown): Date | null {
  if (value instanceof Date) return value;
  if (typeof value === 'string' && value.trim()) {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }
  return null;
}

// Helper function to create position relation for Prisma update
function createPositionRelation(positionId: number | null | undefined) {
  if (positionId === undefined) {
    return undefined; // Don't change the relation
  }

  if (positionId === null) {
    return { disconnect: true }; // Remove position relation
  }

  return { connect: { id: positionId } }; // Set position relation
}

// Server Action: Creates a new employee with optional technologies and position
export async function createEmployee(input: FormData | Record<string, unknown>) {
  try {
    const { data: payload, technologyIds, positionId } = parseFormData(input);

    // Convert date strings to Date objects
    if (payload.busy_from !== undefined) {
      payload.busy_from = convertDateField(payload.busy_from);
    }
    if (payload.busy_to !== undefined) {
      payload.busy_to = convertDateField(payload.busy_to);
    }

    // Handle position_id from parsed data
    if (positionId !== undefined) {
      payload.position_id = positionId;
    }

    if (technologyIds && technologyIds.length > 0) {
      payload.technologyIds = technologyIds;
    }

    // Validate employee data
    const validationResult = newEmployeeSchema.safeParse(payload);
    if (!validationResult.success) {
      const errors = validationResult.error.flatten();
      console.error('Create Employee Validation Error:', errors);
      return {
        ok: false,
        error: 'Błędy walidacji formularza',
        fieldErrors: errors.fieldErrors,
        formErrors: errors.formErrors,
      };
    }

    const validData = validationResult.data;
    let createdId: number;

    await prisma.$transaction(async (tx) => {
      // Prepare data for creation
      const createData: Prisma.employeesCreateInput = {
        first_name: validData.first_name,
        last_name: validData.last_name,
        busy_from: validData.busy_from,
        busy_to: validData.busy_to,
        status: validData.status,
      };
      if (validData.position_id) {
        createData.position = { connect: { id: validData.position_id } };
      }

      // Create employee
      const created = await tx.employees.create({
        data: createData,
        select: { id: true },
      });

      createdId = created.id;

      // Assign technologies if provided
      if (technologyIds?.length) {
        // Verify technologies exist
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

// Server Action: Updates an existing employee with optional technologies and position
export async function updateEmployee(
  id: number | string,
  input: FormData | Record<string, unknown>,
) {
  try {
    // Validate ID parameter
    if (!id) throw new Error('Brak ID pracownika');

    const parsedId = typeof id === 'string' ? parseInt(id, 10) : id;
    if (Number.isNaN(parsedId)) throw new Error('Nieprawidłowe ID pracownika');

    const { data: payload, technologyIds, positionId } = parseFormData(input);

    // Convert date strings to Date objects
    if (payload.busy_from !== undefined) {
      payload.busy_from = convertDateField(payload.busy_from);
    }
    if (payload.busy_to !== undefined) {
      payload.busy_to = convertDateField(payload.busy_to);
    }

    if (technologyIds !== undefined) {
      payload.technologyIds = technologyIds;
    }

    // Validate employee data with ID
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
    const hasTechnologyUpdates = technologyIds !== undefined;
    const hasPositionUpdate = positionId !== undefined;

    await prisma.$transaction(async (tx) => {
      // Check if employee exists
      const existingEmployee = await tx.employees.findUnique({
        where: { id: parsedId },
      });

      if (!existingEmployee) {
        throw new Error('Pracownik nie istnieje');
      }

      // Prepare update data
      const updateData: Prisma.employeesUpdateInput = {};

      if (validData.first_name !== undefined) updateData.first_name = validData.first_name;
      if (validData.last_name !== undefined) updateData.last_name = validData.last_name;
      if (validData.busy_from !== undefined) updateData.busy_from = validData.busy_from;
      if (validData.busy_to !== undefined) updateData.busy_to = validData.busy_to;
      if (validData.status !== undefined) updateData.status = validData.status;

      // Handle position update
      if (hasPositionUpdate) {
        // Check if exists (only if connecting)
        if (positionId) {
          const positionExists = await tx.positions.findUnique({
            where: { id: positionId },
            select: { id: true },
          });

          if (!positionExists) {
            throw new Error('Wybrana pozycja nie istnieje w systemie');
          }
        }
        updateData.position = createPositionRelation(positionId);
      }

      const hasEmployeeUpdates = Object.keys(updateData).length > 0;

      if (!hasEmployeeUpdates && !hasTechnologyUpdates) {
        return;
      }

      // Update employee data if changed
      if (hasEmployeeUpdates) {
        await tx.employees.update({
          where: { id: parsedId },
          data: updateData,
        });
      }

      // Update technologies if specified
      if (hasTechnologyUpdates) {
        // Remove existing associations
        await tx.employee_technology.deleteMany({
          where: { employee_id: parsedId },
        });

        // Add new associations if provided
        if (Array.isArray(technologyIds) && technologyIds.length > 0) {
          // Verify technologies exist
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

// Server Action: Updates the technologies associated with an employee
export async function updateEmployeeTechnologiesAction(
  employeeId: number,
  technologyIds: number[],
) {
  try {
    await setEmployeeTechnologies(employeeId, technologyIds);

    revalidatePath('/dashboard/employees');
    return { ok: true };
  } catch (error) {
    console.error('Error updating technologies:', error);
    return { ok: false, error: 'Nie udało się zaktualizować technologii' };
  }
}
