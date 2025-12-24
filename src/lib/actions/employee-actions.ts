'use server';

import { revalidatePath } from 'next/cache';
import { newEmployeeSchema, updateEmployeeSchema } from '@/lib/schemas/employeeSchema';
import { prisma } from '@/lib/prisma-client';
import type { Prisma } from '@/generated/prisma/client';
import { setEmployeeTechnologies } from '@/lib/actions/technology-actions';

/**
 * Parses FormData or Record input into structured data
 * Handles technology_ids array and position_id field
 * @param input - FormData or Record<string, unknown>
 * @returns Object with data, technologyIds, and positionId
 */
function parseFormData(input: FormData | Record<string, unknown>) {
  if (!(input instanceof FormData)) {
    // For JSON input, return as-is (assumes no technology updates)
    return { data: input, technologyIds: undefined, positionId: undefined };
  }

  const formData = input;
  const data: Record<string, unknown> = {};
  const technologyIds: number[] = [];
  let positionId: number | null = null;

  // Iterate through FormData entries
  for (const [key, value] of formData.entries()) {
    // Handle technology_ids (can be array with brackets)
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

/**
 * Converts various date formats to Date object or null
 * @param value - Unknown date value (string, Date, etc.)
 * @returns Date | null - Parsed date or null if invalid
 */
function convertDateField(value: unknown): Date | null {
  if (value instanceof Date) return value;
  if (typeof value === 'string' && value.trim()) {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }
  return null;
}

/**
 * Converts positionId to Prisma relation format
 * @param positionId - Position ID (number, null, or undefined)
 * @returns Prisma relation object for position field
 */
function createPositionRelation(positionId: number | null | undefined) {
  if (positionId === undefined) {
    return undefined; // Don't change the relation
  }

  if (positionId === null) {
    return { disconnect: true }; // Remove position relation
  }

  return { connect: { id: positionId } }; // Set position relation
}

/**
 * Server Action: Creates a new employee with technologies and position
 * Handles FormData or Record input
 * @param input - FormData or Record with employee data
 * @returns Result object with success/failure status
 */
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

    // Validate employee data
    const validationResult = newEmployeeSchema.safeParse(payload);
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

      // Set position relation if defined
      if (validData.position_id !== undefined) {
        createData.position = createPositionRelation(validData.position_id);
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

/**
 * Server Action: Updates an existing employee
 * Supports partial updates of employee data, technologies, and position
 * @param id - Employee ID (number or string)
 * @param input - FormData or Record with updated data
 * @returns Result object with success/failure status
 */
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
      if (hasPositionUpdate && positionId !== null && positionId !== undefined) {
        // Check if exits
        const positionExists = await tx.positions.findUnique({
          where: { id: positionId },
          select: { id: true },
        });

        if (!positionExists) {
          throw new Error('Wybrana pozycja nie istnieje w systemie');
        }
        updateData.position = createPositionRelation(positionId);
      }

      const hasEmployeeUpdates = Object.keys(updateData).length > 0;

      if (!hasEmployeeUpdates && !hasTechnologyUpdates) {
        throw new Error('Nie podano żadnych pól do aktualizacji');
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

/**
 * Server Action: Fetches an employee with their technologies and position
 * @param id - Employee ID (number or string)
 * @returns Result object with employee data or error
 */
export async function getEmployeeWithTechnologies(id: number | string) {
  try {
    const parsedId = typeof id === 'string' ? parseInt(id, 10) : id;
    if (Number.isNaN(parsedId)) throw new Error('Nieprawidłowe ID pracownika');

    // Fetch employee with relations
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
        position: {
          select: {
            id: true,
            name: true,
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

    // Format response: flatten employee_technology to technologies array
    const formattedEmployee = {
      ...employee,
      technologies: employee.employee_technology.map((et) => ({
        id: et.technologies.id,
        name: et.technologies.name,
      })),
      position: employee.position,
    };

    // Remove intermediate relation field for cleaner API response
    // delete formattedEmployee.employee_technology;

    return { ok: true, data: formattedEmployee };
  } catch (err: unknown) {
    console.error('Błąd pobierania pracownika:', err);
    const message =
      err instanceof Error ? err.message : 'Błąd podczas pobierania danych pracownika';
    return { ok: false, error: message };
  }
}

/**
 * Server Action: Updates employee technologies from interactive cell
 * Wrapper around setEmployeeTechnologies with revalidation
 * @param employeeId - Employee ID
 * @param technologyIds - Array of technology IDs
 * @returns Result object with success/failure status
 */
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
