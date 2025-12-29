import { z } from 'zod';

// Base schema for client address validation
export const clientAddressBaseSchema = z.object({
  id: z.number().int().positive().optional(),
  client_id: z.number().int().positive({ message: 'Nieprawidłowe ID klienta' }).optional(),
  city: z
    .string()
    .min(1, { message: 'Miasto nie może być puste' })
    .max(100, { message: 'Miasto nie może przekraczać 100 znaków' })
    .regex(/^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s\-]+$/, {
      message: 'Miasto może zawierać tylko litery, spacje i myślniki',
    }),
  postal_code: z
    .string()
    .min(1, { message: 'Kod pocztowy nie może być pusty' })
    .max(6, { message: 'Kod pocztowy nie może przekraczać 6 znaków' })
    .regex(/^\d{2}-\d{3}$/, { message: 'Nieprawidłowy format kodu pocztowego (np. 00-000)' }),
  street: z
    .string()
    .min(1, { message: 'Ulica nie może być pusta' })
    .max(100, { message: 'Ulica nie może przekraczać 100 znaków' })
    .regex(/^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ0-9\s\.\-]+$/, {
      message: 'Ulica może zawierać tylko litery, cyfry, spacje, kropki i myślniki',
    }),
  building_number: z
    .string()
    .min(1, { message: 'Numer budynku nie może być pusty' })
    .max(20, { message: 'Numer budynku nie może przekraczać 20 znaków' })
    .regex(/^[a-zA-Z0-9\/\-]+$/, {
      message: 'Numer budynku może zawierać tylko litery, cyfry, ukośniki i myślniki',
    }),
  nip: z
    .string()
    .min(1, { message: 'NIP nie może być pusty' })
    .max(15, { message: 'NIP nie może przekraczać 15 znaków' })
    .regex(/^[0-9]{10}$/, { message: 'NIP musi składać się z 10 cyfr' })
    .refine(
      (nip) => {
        // Algorithm for validating Polish NIP
        const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7];
        let sum = 0;

        for (let i = 0; i < 9; i++) {
          sum += parseInt(nip[i]) * weights[i];
        }

        const controlDigit = sum % 11;
        return controlDigit === parseInt(nip[9]);
      },
      { message: 'Nieprawidłowy numer NIP (błąd sumy kontrolnej)' },
    ),
});

// Base schema for client validation
export const clientBaseSchema = z.object({
  id: z.number().int().positive({ message: 'Nieprawidłowe ID klienta' }).optional(),
  first_name: z
    .string()
    .min(1, { message: 'Imię nie może być puste' })
    .max(100, { message: 'Imię nie może przekraczać 100 znaków' })
    .regex(/^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s\-]+$/, {
      message: 'Imię może zawierać tylko litery, spacje i myślniki',
    }),
  last_name: z
    .string()
    .min(1, { message: 'Nazwisko nie może być puste' })
    .max(100, { message: 'Nazwisko nie może przekraczać 100 znaków' })
    .regex(/^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s\-]+$/, {
      message: 'Nazwisko może zawierać tylko litery, spacje i myślniki',
    }),
  is_lead: z.boolean(), // Required boolean field (no default value in Prisma)
  email: z
    .string()
    .min(1, { message: 'Email nie może być pusty' })
    .max(150, { message: 'Email nie może przekraczać 150 znaków' })
    .email({ message: 'Nieprawidłowy format email' })
    .toLowerCase(),
  phone: z
    .string()
    .max(30, { message: 'Telefon nie może przekraczać 30 znaków' })
    .regex(/^[0-9\s\-\+\(\)]+$/, { message: 'Nieprawidłowy format telefonu' })
    .nullable()
    .optional()
    .or(z.literal('')),
});

// Schema for creating a new client (without ID) - is_lead is required
export const newClientSchema = clientBaseSchema.omit({ id: true });

// Schema for updating a client (partial update with ID required) - is_lead is optional
export const updateClientSchema = clientBaseSchema.partial().extend({
  id: z.number().int().positive({ message: 'Nieprawidłowe ID klienta' }),
});

// Schema for creating a new client address (without ID and client_id optional)
export const newClientAddressSchema = clientAddressBaseSchema.omit({ id: true, client_id: true });

// Schema for updating a client address (partial update)
export const updateClientAddressSchema = clientAddressBaseSchema.partial().extend({
  id: z.number().int().positive({ message: 'Nieprawidłowe ID adresu' }).optional(),
  client_id: z.number().int().positive({ message: 'Nieprawidłowe ID klienta' }).optional(),
});

// Combined schema for creating client with address in one form
export const newClientWithAddressSchema = z.object({
  client: newClientSchema,
  address: newClientAddressSchema.optional(), // Address optional when creating
});

// Combined schema for updating client with address
export const updateClientWithAddressSchema = z.object({
  client: updateClientSchema,
  address: updateClientAddressSchema.optional(),
});

// Schema for client with address relation (for API responses)
export const clientWithAddressSchema = clientBaseSchema.extend({
  client_addresses: clientAddressBaseSchema.nullable().optional(),
});

// Schema for client selection (dropdowns, etc.)
export const clientSelectionSchema = z.object({
  id: z.number().int().positive(),
  first_name: z.string(),
  last_name: z.string(),
  email: z.string().email(),
  is_lead: z.boolean(),
});

// TypeScript types inference
export type ClientBase = z.infer<typeof clientBaseSchema>;
export type NewClient = z.infer<typeof newClientSchema>;
export type UpdateClient = z.infer<typeof updateClientSchema>;
export type ClientAddressBase = z.infer<typeof clientAddressBaseSchema>;
export type NewClientAddress = z.infer<typeof newClientAddressSchema>;
export type UpdateClientAddress = z.infer<typeof updateClientAddressSchema>;
export type ClientWithAddress = z.infer<typeof clientWithAddressSchema>;
export type NewClientWithAddress = z.infer<typeof newClientWithAddressSchema>;
export type UpdateClientWithAddress = z.infer<typeof updateClientWithAddressSchema>;
export type ClientSelection = z.infer<typeof clientSelectionSchema>;
