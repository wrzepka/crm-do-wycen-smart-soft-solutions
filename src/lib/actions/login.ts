'use server';

import { loginSchema } from '../schemas/authSchema';

/**
 * Success payload returned by the Server Action.
 * The client will use these validated values to call next-auth/react -> signIn("credentials", {...}).
 */
export type LoginActionSuccess = {
  ok: true;
  email: string;
  password: string;
};

/**
 * Error payload returned by the Server Action.
 * Includes a generic message and normalized Zod errors (field + form errors) for UI rendering.
 */
export type LoginActionError = {
  ok: false;
  error: string;
  fieldErrors?: Record<string, string[]>;
  formErrors?: string[];
};

/**
 * Union type for the Server Action result.
 */
export type LoginActionResult = LoginActionSuccess | LoginActionError;

/**
 * Server Action (v4):
 * - Reads raw FormData, normalizes to strings.
 * - Validates with Zod (your schema from ./src/lib/schemas/authSchema.ts).
 * - Returns either structured errors or validated values.
 * - IMPORTANT (v4): We DO NOT call next-auth's signIn here; that's a client-side API (next-auth/react).
 *                   The client component should call signIn("credentials", {...}) after a successful validation.
 */
export async function loginAction(formData: FormData): Promise<LoginActionResult> {
  // Normalize FormDataEntryValue to strings; ensures Zod receives predictable input.
  const data = {
    email: String(formData.get('email') ?? ''),
    password: String(formData.get('password') ?? ''),
  };

  // Validate using shared Zod schema.
  const parsed = loginSchema.safeParse(data);

  if (!parsed.success) {
    // Zod's flatten() produces fieldErrors (per-field arrays) and formErrors (top-level).
    const { fieldErrors, formErrors } = parsed.error.flatten();
    return {
      ok: false,
      error: 'Invalid login data',
      fieldErrors,
      formErrors,
    };
  }

  // On success, return validated values to the client.
  // The client will call signIn("credentials", { email, password, redirect: false }) and handle UI/redirects.
  return {
    ok: true,
    email: parsed.data.email,
    password: parsed.data.password,
  };
}
