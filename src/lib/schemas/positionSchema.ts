import { z } from 'zod';

const currencySchema = z.coerce
  .number({ message: 'Wartość musi być liczbą' })
  .min(0, { message: 'Wartość nie może być ujemna' })
  .default(0);

export const positionBaseSchema = z.object({
  id: z.number().int().positive({ message: 'ID pozycji musi być dodatnie' }),

  name: z
    .string()
    .min(2, { message: 'Nazwa pozycji musi mieć minimum 2 znaki' })
    .max(100, { message: 'Nazwa pozycji jest zbyt długa' }),

  cost: currencySchema,
  rate: currencySchema,
});

export const newPositionSchema = positionBaseSchema
  .omit({ id: true })
  .refine((data) => data.rate >= data.cost, {
    message: 'Stawka dla klienta nie może być niższa niż koszt pracownika',
    path: ['rate'], // <-- Tu wskazujemy, pod którym polem ma się wyświetlić błąd!
  });

export const updatePositionSchema = positionBaseSchema
  .extend({
    // coerce is changing string into a number.
    // id is here probably redundant, because we are passing id as standalone argument.
    id: z.coerce.number().int().positive({ message: 'ID pozycji musi być dodatnie' }),
    // <------- there was duplicated variable name
  })
  .refine((data) => data.rate >= data.cost, {
    message: 'Stawka dla klienta nie może być niższa niż koszt pracownika',
    path: ['rate'],
  });

// Position selection schema (used in employee forms)
export const positionSelectionSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  rate: z.number().nullable().optional(),
  cost: z.number().nullable().optional(),
});

export const deletePositionSchema = z.object({
  id: z.number().int().positive({ message: 'ID pozycji musi być dodatnie' }),
});
