import { getSafeEmployees, getEmployeeStats } from '@/lib/data/employee';
import { EmployeeListTable } from '@/components/dashboard/employees/employee-list-table';
import { EmployeeSheet } from '@/components/dashboard/employees/employee-sheet';
import { Users, Briefcase, CheckCircle, Clock, type LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { getTechnologies } from '@/lib/data/technology';
import { getPositionsOptions } from '@/lib/data/position';
import { EmployeeFilters } from '@/components/dashboard/employees/employee-filters';
import { EMPLOYEE_STATUS_OPTIONS } from '@/lib/constants';
import { DataTablePagination } from '@/components/shared/data-pagination';

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; query?: string; status?: string; position?: string }>;
}) {
  const { page, query, status, position } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);
  // Get query and client type(isLead) from URL
  const searchQuery = query || '';
  const employeeStatus = status || '';
  const employeePosition = position || '';
  const pageSize = 25;

  const [{ employees, totalPages }, stats, technologiesResult, positions] = await Promise.all([
    getSafeEmployees(searchQuery, employeeStatus, employeePosition, currentPage, pageSize),
    getEmployeeStats(),
    getTechnologies(),
    getPositionsOptions(),
  ]);

  const positionOptions = positions.map((position) => ({
    value: String(position.id),
    label: position.name,
  }));

  return (
    <div className="p-8 space-y-8 min-h-full bg-slate-50/50 dark:bg-[#020817]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Zespół
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Zarządzaj dostępnością i alokacją Twoich specjalistów.
          </p>
        </div>
        <EmployeeSheet allTechnologies={technologiesResult} allPositions={positions} />
      </div>

      {/* Grid layout for displaying key performance indicator cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Wszyscy Pracownicy"
          value={stats.total}
          icon={Users}
          description="Całkowita liczba w bazie"
        />
        <StatCard
          title="Dostępni (Ławka)"
          value={stats.available}
          icon={CheckCircle}
          className="border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-900/10"
          iconColor="text-emerald-600"
          description="Gotowi do przypisania"
        />
        <StatCard
          title="W Projektach"
          value={stats.booked}
          icon={Briefcase}
          iconColor="text-blue-600"
          description="Aktualnie pracują komercyjnie"
        />
        <StatCard
          title="Urlopy / Niedostępni"
          value={stats.on_leave + stats.onboarding}
          icon={Clock}
          iconColor="text-slate-500"
          description="Tymczasowo nieobecni"
        />
      </div>

      <EmployeeFilters
        statusOptions={EMPLOYEE_STATUS_OPTIONS}
        positionOptions={positionOptions}
      ></EmployeeFilters>

      {/* Interactive table component displaying the list of employees */}
      <EmployeeListTable
        data={employees}
        allTechnologies={technologiesResult}
        allPositions={positions}
      />
      <div className="mt-4 flex justify-center">
        <DataTablePagination currentPage={currentPage} totalPages={totalPages} />
      </div>
    </div>
  );
}

// Interface defining the expected props for the StatCard component
interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  description: string;
  className?: string;
  iconColor?: string;
}

// Reusable component for rendering individual statistic cards
function StatCard({
  title,
  value,
  icon: Icon,
  description,
  className,
  iconColor = 'text-slate-900 dark:text-white',
}: StatCardProps) {
  return (
    <Card className={`border-slate-200 dark:border-slate-800 shadow-sm ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{value}</div>
          <p className="text-xs text-slate-400 dark:text-slate-500">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
