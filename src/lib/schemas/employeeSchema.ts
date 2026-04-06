import { z } from 'zod';
import { positionSelectionSchema } from './positionSchema';
import { technologyIdsSchema } from './technologySchema';
import { EmployeeStatusType } from '@/types/employee';

type DatesLogicInput = {
  status?: string | null;
  busy_from?: Date | null;
  busy_to?: Date | null;
};

// Employee status enum - possible states of an employee
export const EmployeeStatus = z.enum([
  'ACTIVE_AVAILABLE',
  'ACTIVE_BOOKED',
  'ON_LEAVE',
  'TERMINATED',
  'ONBOARDING',
]);

// List of statuses where dates are allowed (even required)
const STATUSES_ALLOWING_DATES: EmployeeStatusType[] = ['ACTIVE_BOOKED', 'ON_LEAVE', 'ONBOARDING'];

const validateDatesLogic = (data: DatesLogicInput, ctx: z.RefinementCtx) => {
  const hasFrom = !!data.busy_from;
  const hasTo = !!data.busy_to;

  const hasCompletedRange = hasFrom && hasTo;
  const hasAnyDate = hasFrom || hasTo;

  // ### DATES CHECK ###
  if (hasFrom && !hasTo) {
    ctx.addIssue({
      code: 'custom',
      message: 'Data zakończenia jest wymagana.',
      path: ['busy_to'],
    });
  }

  if (!hasFrom && hasTo) {
    ctx.addIssue({
      code: 'custom',
      message: 'Data rozpoczęcia jest wymagana.',
      path: ['busy_from'],
    });
  }

  if (data.busy_from && data.busy_to && data.busy_to <= data.busy_from) {
    ctx.addIssue({
      code: 'custom',
      message: 'Data zakończenia musi być późniejsza niż startu.',
      path: ['busy_to'],
    });
  }

  // ### STATUS CHECK ###
  // Only true, if someone modified payload
  if (hasAnyDate && !data.status) {
    ctx.addIssue({
      code: 'custom',
      message: 'Przy ustawianiu dat zajętości wymagane jest przesłanie statusu.',
      path: ['status'],
    });
    // There is no status so we don't to check next validation
    return;
  }

  if (data.status) {
    // Compare statuses
    const isDateAllowed = (STATUSES_ALLOWING_DATES as string[]).includes(data.status);

    if (hasAnyDate && !isDateAllowed) {
      ctx.addIssue({
        code: 'custom',
        message: `Aktualny status nie może mieć przypisanych dat zajętości.`,
        path: ['status'],
      });
    }

    if (!hasCompletedRange && isDateAllowed) {
      if (!hasFrom)
        ctx.addIssue({
          code: 'custom',
          message: `Aktualny status wymaga przypisania daty rozpoczęcia`,
          path: ['busy_from'],
        });

      if (!hasTo) {
        ctx.addIssue({
          code: 'custom',
          message: `Aktualny status wymaga przypisania daty zakończenia`,
          path: ['busy_to'],
        });
      }
    }
  }
};

// Schema for technology selection in forms (used for validation)
export const technologySelectionSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
});

// Base schema for employee data validation
export const employeeBaseSchema = z.object({
  id: z.number().int().positive({ message: 'Nie poprawne ID pracownika' }),
  first_name: z
    .string()
    .min(1, { message: 'Imię nie może być puste' })
    .max(100, { message: 'Imię nie może przekraczać 100 znaków' }),
  last_name: z
    .string()
    .min(1, { message: 'Nazwisko nie może być puste' })
    .max(100, { message: 'Nazwisko nie może przekraczać 100 znaków' }),
  busy_from: z.date().nullable().optional(), // Start date of busy period (optional)
  busy_to: z.date().nullable().optional(), // End date of busy period (optional)
  // For interactive cell to update employee technologies - using imported schema
  technologyIds: technologyIdsSchema,
  status: EmployeeStatus.default('ACTIVE_AVAILABLE'), // Default status
  position_id: z
    .number()
    .int()
    .positive({ message: 'Nie poprawne ID stanowiska' })
    .nullable()
    .optional(), // Position reference
});

// Schema for creating a new employee (without ID)
export const newEmployeeSchema = employeeBaseSchema
  .omit({ id: true })
  .superRefine(validateDatesLogic);

// Schema for updating an employee (partial update with ID required)
export const updateEmployeeSchema = employeeBaseSchema
  .partial()
  .extend({
    id: z.number().int().positive(),
    status: EmployeeStatus.optional(),
  })
  .superRefine(validateDatesLogic);

// Extended schema for employee with technologies relation
export const employeeWithTechnologiesSchema = employeeBaseSchema.extend({
  technologies: z.array(technologySelectionSchema),
  position: positionSelectionSchema.nullable().optional(),
});
