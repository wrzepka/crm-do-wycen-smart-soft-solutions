import { z } from 'zod';

// Base schema for technology
export const technologyBaseSchema = z.object({
  id: z.number().int().positive({ message: 'Nie poprawne ID technologii' }),
  name: z
    .string()
    .min(1, { message: 'Nazwa technologii nie może być pusta' })
    .max(100, { message: 'Nazwa technologii nie może przekraczać 100 znaków' }),
});

// Schema for creating a new technology (without ID)
export const newTechnologySchema = technologyBaseSchema.omit({ id: true });

// Schema for updating a technology (partial update with ID required)
export const updateTechnologySchema = technologyBaseSchema.partial().extend({
  id: z.number().int().positive(),
});

// Schema for validating an array of technology IDs
// This schema can be imported and reused in other schemas (like employeeSchema)
export const technologyIdsSchema = z
  .array(
    z.number().int().positive({ message: 'ID technologii musi być dodatnią liczbą całkowitą' }),
  )
  .optional();
