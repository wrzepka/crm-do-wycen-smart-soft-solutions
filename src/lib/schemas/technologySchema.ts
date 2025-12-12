// src/lib/schemas/technologySchema.ts
import { z } from 'zod';

// Bazowy schemat technologii
export const technologyBaseSchema = z.object({
  id: z.number().int().positive(),
  name: z
    .string()
    .min(1, { message: 'Nazwa technologii nie może być pusta' })
    .max(100, { message: 'Nazwa technologii nie może przekraczać 100 znaków' }),
});

// Schemat do tworzenia nowej technologii
export const newTechnologySchema = technologyBaseSchema.omit({ id: true });

// Schemat do aktualizacji technologii
export const updateTechnologySchema = technologyBaseSchema.partial().extend({
  id: z.number().int().positive(),
});

// Schemat do walidacji listy ID technologii
export const technologyIdsSchema = z
  .array(
    z.number().int().positive({ message: 'ID technologii musi być dodatnią liczbą całkowitą' }),
  )
  .optional();
