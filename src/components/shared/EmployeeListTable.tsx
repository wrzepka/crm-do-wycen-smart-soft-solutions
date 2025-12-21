'use client'; // Marking this as a Client Component to allow state and interactivity

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit2, Search } from 'lucide-react';
import { EmployeeWithRelations } from '@/types/employee';
import { EmployeeSheet } from '@/components/dashboard/employees/employee-sheet';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { EmployeeTechnologiesCell } from '@/components/dashboard/employees/employee-technologies-cell';

// Defining props interface to ensure type safety for employee data input
interface Props {
  data: EmployeeWithRelations[];
  // adding all technologies from page.tsx
  allTechnologies: { id: number; name: string }[];
}

export function EmployeeListTable({ data, allTechnologies }: Props) {
  // State to manage the search input value visual state
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-4">
      {/* Top bar containing the search input and result count indicator */}
      <div className="flex items-center justify-between">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Szukaj pracownika..."
            className="pl-8 bg-white dark:bg-[#0B1121] border-slate-200 dark:border-slate-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-sm text-slate-500">
          Wyświetlono:{' '}
          <span className="font-medium text-slate-900 dark:text-white">{data.length}</span>
        </div>
      </div>

      {/* Main table container with border and rounded corners styling */}
      <div className="rounded-xl border bg-white dark:bg-[#0B1121] border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
            <TableRow className="border-slate-200 dark:border-slate-800 hover:bg-transparent">
              <TableHead className="text-slate-500 font-semibold pl-6">Pracownik</TableHead>
              <TableHead className="text-slate-500 font-semibold">Status</TableHead>
              <TableHead className="text-slate-500 font-semibold w-[35%]">Technologie</TableHead>
              <TableHead className="text-right text-slate-500 font-semibold pr-6">Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Conditional rendering: Show message if no results found, otherwise list employees */}
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                  Brak pracowników w bazie danych
                </TableCell>
              </TableRow>
            ) : (
              // Mapping directly over raw data without client-side filtering
              data.map((employee) => (
                <TableRow
                  key={employee.id}
                  className="border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors"
                >
                  <TableCell className="pl-6">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900 dark:text-white text-base">
                        {employee.first_name} {employee.last_name}
                      </span>
                      <span className="text-xs text-slate-500">Programista</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1.5">
                      {/* Using helper component to render styled status badge */}
                      <StatusBadge status={employee.status} />

                      {/* Display date range only for booked employees or those on leave */}
                      {(employee.status === 'ACTIVE_BOOKED' || employee.status === 'ON_LEAVE') && (
                        <span className="text-[11px] text-slate-400 font-mono">
                          {employee.busy_from
                            ? new Date(employee.busy_from).toLocaleDateString('pl-PL')
                            : ''}{' '}
                          →{' '}
                          {employee.busy_to
                            ? new Date(employee.busy_to).toLocaleDateString('pl-PL')
                            : ''}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <EmployeeTechnologiesCell
                      employeeId={employee.id}
                      initialTechIds={employee.employee_technology.map((et) => et.technology_id)}
                      allTechnologies={allTechnologies}
                    />
                  </TableCell>

                  <TableCell className="text-right pr-6">
                    {/* Triggering the edit sheet with the selected employee data */}
                    <EmployeeSheet employee={employee}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer"
                      >
                        <Edit2 size={15} />
                      </Button>
                    </EmployeeSheet>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// Helper component to render status badges with specific styles and labels
function StatusBadge({ status }: { status: string }) {
  // Mapping status keys to Tailwind CSS classes for consistent styling
  const styles = {
    ACTIVE_AVAILABLE:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
    ACTIVE_BOOKED:
      'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
    ON_LEAVE:
      'bg-slate-100 text-slate-700 dark:bg-slate-700/40 dark:text-slate-400 border-slate-200 dark:border-slate-600',
    ONBOARDING:
      'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border-purple-200 dark:border-purple-500/20',
    TERMINATED:
      'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-900/30',
  };

  // Mapping status keys to human-readable Polish labels
  const labels = {
    ACTIVE_AVAILABLE: 'Dostępny',
    ACTIVE_BOOKED: 'W projekcie',
    ON_LEAVE: 'Urlop',
    ONBOARDING: 'Wdrożenie',
    TERMINATED: 'Zwolniony',
  };

  // Fallback to default style and status text if key is not found
  const currentStyle = styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-700';
  const label = labels[status as keyof typeof labels] || status;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border w-fit ${currentStyle}`}
    >
      {/* Adding a pulsing dot indicator for available employees */}
      {status === 'ACTIVE_AVAILABLE' && (
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
      )}
      {label}
    </span>
  );
}
