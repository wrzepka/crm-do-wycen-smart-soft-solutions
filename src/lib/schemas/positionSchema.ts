import { z } from 'zod';

export const positionBaseSchema = z.object({
  id: z.number().int().positive({ message: 'ID pozycji musi być dodatnie' }).optional(),
  name: z
    .string()
    .min(1, { message: 'Nazwa pozycji nie może być pusta' })
    .max(100, { message: 'Nazwa pozycji nie może przekraczać 100 znaków' }),
});

export const newPositionSchema = positionBaseSchema.omit({ id: true });

export const updatePositionSchema = positionBaseSchema.extend({
  // coerce is changing string into a number.
  // id is here probably redundant, because we are passing id as standalone argument.
  id: z.coerce.number().int().positive({ message: 'ID pozycji musi być dodatnie' }),
  name: z
    .string()
    .min(1, { message: 'Nazwa pozycji nie może być pusta' })
    .max(100, { message: 'Nazwa pozycji nie może przekraczać 100 znaków' }),
});

// Position selection schema (used in employee forms)
export const positionSelectionSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
});

export const deletePositionSchema = z.object({
  id: z.number().int().positive(),
});

export type PositionBase = z.infer<typeof positionBaseSchema>;
export type NewPositionInput = z.infer<typeof newPositionSchema>;
export type UpdatePositionInput = z.infer<typeof updatePositionSchema>;
export type PositionSelection = z.infer<typeof positionSelectionSchema>;
export type DeletePositionInput = z.infer<typeof deletePositionSchema>;
