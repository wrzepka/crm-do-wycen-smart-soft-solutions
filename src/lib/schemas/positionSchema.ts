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
  id: z.number().int().positive({ message: 'ID pozycji musi być dodatnie' }),
});

// Position selection schema (used in employee forms)
export const positionSelectionSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
});
