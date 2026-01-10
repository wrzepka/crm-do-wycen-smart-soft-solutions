'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma-client';
// POPRAWKA: Importujemy typ 'positions' (model z bazy) aby uniknąć 'any'
import { Prisma, type positions } from '@/generated/prisma/client';
import {
  deletePositionSchema,
  newPositionSchema,
  updatePositionSchema,
} from '@/lib/schemas/positionSchema';
import { NewPositionInput, UpdatePositionInput } from '@/types/position';

// helper function to convert decimal to number to avoid next.js serialization error
function serializePosition(position: positions) {
  return {
    ...position,
    hourly_rate: position.hourly_rate ? position.hourly_rate.toNumber() : null,
  };
}

export async function createPosition(data: NewPositionInput) {
  //  TODO: session check with role authorization.
  // zod validation
  const validation = newPositionSchema.safeParse(data);
  if (!validation.success) {
    const errors = validation.error.flatten();
    return {
      ok: false,
      error: 'Błędy walidacji formularza',
      fieldErrors: errors.fieldErrors,
      formErrors: errors.formErrors,
    };
  }

  try {
    const position = await prisma.positions.create({
      data: {
        name: validation.data.name,
        hourly_rate: validation.data.hourly_rate,
      },
    });

    // reload cache
    revalidatePath('/dashboard/positions');

    // return serialized data (decimal -> number)
    return {
      ok: true,
      data: serializePosition(position),
    };
  } catch (error) {
    console.error('Create position error:', error);

    // Check if this error is known by prisma
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // P2002 = Unique constraint failed
      if (error.code === 'P2002') {
        return {
          ok: false,
          error: 'Stanowisko o tej nazwie już istnieje w systemie.',
        };
      }
    }

    // otherwise return default error
    const message = error instanceof Error ? error.message : 'Błąd podczas tworzenia stanowiska';
    return { ok: false, error: message };
  }
}

export async function updatePosition(id: number, data: UpdatePositionInput) {
  //  TODO: session check with role authorization.
  // zod validation
  // We need to merge data with id to properly pass validation
  const validation = updatePositionSchema.safeParse({ ...data, id });
  if (!validation.success) {
    const errors = validation.error.flatten();
    return {
      ok: false,
      error: 'Błędy walidacji formularza',
      fieldErrors: errors.fieldErrors,
      formErrors: errors.formErrors,
    };
  }

  try {
    const position = await prisma.positions.update({
      where: { id: id },
      data: {
        name: validation.data.name,
        hourly_rate: validation.data.hourly_rate,
      },
    });

    // reload cache
    revalidatePath('/dashboard/positions');
    revalidatePath('/dashboard/employees'); // can affect costs i think

    // return serialized data (decimal -> number)
    return {
      ok: true,
      data: serializePosition(position),
    };
  } catch (error) {
    console.error('Update position error:', error);

    // Check if this error is known by prisma
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // P2002 = Unique constraint failed
      if (error.code === 'P2002') {
        return {
          ok: false,
          error: 'Stanowisko o tej nazwie już istnieje w systemie.',
        };
      }
    }

    // otherwise return default error
    const message = error instanceof Error ? error.message : 'Błąd podczas aktualizacji stanowiska';
    return { ok: false, error: message };
  }
}

export async function deletePosition(id: number) {
  //  TODO: session check with role authorization.
  // zod validation
  const validation = deletePositionSchema.safeParse({ id });
  if (!validation.success) {
    const errors = validation.error.flatten();
    return {
      ok: false,
      error: 'Błędy walidacji formularza',
      fieldErrors: errors.fieldErrors,
      formErrors: errors.formErrors,
    };
  }

  try {
    // check if it are they arranged to a position
    const employeesWithPosition = await prisma.employees.count({
      where: { position_id: id },
    });

    if (employeesWithPosition > 0) {
      return {
        ok: false,
        error: `Nie można usunąć stanowiska, ponieważ jest przypisane do ${employeesWithPosition} pracowników. Najpierw zmień ich stanowisko.`,
      };
    }

    await prisma.positions.delete({
      where: { id: validation.data.id },
    });

    // reload cache
    revalidatePath('/dashboard/positions');

    return {
      ok: true,
    };
  } catch (error) {
    console.error('Delete position error:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // P2003 = Foreign key constraint failed on the field
      // There are assigned employees to that position
      if (error.code === 'P2003') {
        return {
          ok: false,
          error:
            'Nie można usunąć stanowiska, ponieważ jest ono przypisane do pracowników lub ofert. Najpierw zmień ich stanowisko.',
        };
      }

      // P2025 = Record to delete does not exist
      if (error.code === 'P2025') {
        return { ok: false, error: 'Stanowisko nie zostało znalezione.' };
      }
    }

    const message = error instanceof Error ? error.message : 'Błąd podczas usuwania stanowiska';
    return { ok: false, error: message };
  }
}
