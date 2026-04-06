/**
 * Generic per-field error map returned by Zod's `flatten().fieldErrors`.
 * Keys are field names, values are arrays of messages for that field.
 */
export type FieldErrors = Record<string, string[]>;

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
  fieldErrors?: FieldErrors;
  formErrors?: string[];
};

/**
 * Union type for the Server Action result.
 */
export type LoginActionResult = LoginActionSuccess | LoginActionError;

//For form validation
export type FormErrors = {
  email?: string[];
  password?: string[];
};
