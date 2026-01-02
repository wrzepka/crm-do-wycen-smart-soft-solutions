import { z } from 'zod';

export const positionBaseSchema = z.object({
  id: z.number().int().positive({ message: 'ID pozycji musi być dodatnie' }).optional(),
  name: z
    .string()
    .min(1, { message: 'Nazwa pozycji nie może być pusta' })
    .max(100, { message: 'Nazwa pozycji nie może przekraczać 100 znaków' }),
  hourly_rate: z
    .union([
      z.string().min(1, { message: 'Stawka godzinowa jest wymagana' }),
      z.number().positive({ message: 'Stawka godzinowa musi być dodatnia' }),
    ])
    .transform((val) => {
      if (typeof val === 'string') {
        const parsed = parseFloat(val);
        return isNaN(parsed) ? null : parsed;
      }
      return val;
    })
    .refine((val) => val === null || val > 0, {
      message: 'Stawka godzinowa musi być dodatnia',
    })
    .nullable()
    .optional(),
});

export const newPositionSchema = positionBaseSchema.omit({ id: true });

export const updatePositionSchema = positionBaseSchema.extend({
  // coerce is changing string into a number.
  // id is here probably redundant, because we are passing id as standalone argument.
  id: z.coerce.number().int().positive({ message: 'ID pozycji musi być dodatnie' }),
  // <------- there was duplicated variable name
});

// Position selection schema (used in employee forms)
export const positionSelectionSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  hourly_rate: z.number().nullable().optional(),
});

export const deletePositionSchema = z.object({
  id: z.number().int().positive(),
});
