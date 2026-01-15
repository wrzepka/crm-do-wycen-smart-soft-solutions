import { EmployeeStatus } from '@/generated/prisma/client';

// dictionary ENG -> PL
// NEED TO BE UPDATED WHEN DB IS MODIFIED!!!
export const EMPLOYEE_STATUS_LABELS: Record<EmployeeStatus, string> = {
  [EmployeeStatus.ACTIVE_AVAILABLE]: 'Dostępny',
  [EmployeeStatus.ACTIVE_BOOKED]: 'Niedostępny',
  [EmployeeStatus.ON_LEAVE]: 'Urlop',
  [EmployeeStatus.TERMINATED]: 'Zwolniony',
  [EmployeeStatus.ONBOARDING]: 'Wdrażany',
};

export const EMPLOYEE_STATUS_OPTIONS = Object.entries(EMPLOYEE_STATUS_LABELS).map(
  ([value, label]) => ({
    value,
    label,
  }),
);
