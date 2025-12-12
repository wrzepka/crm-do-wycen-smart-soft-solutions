import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Adres e-mail jest wymagany.' })
    .email({ message: 'Niepoprawny format adresu e-mail.' }),

  password: z.string().min(1, { message: 'Hasło jest wymagane.' }),
});
