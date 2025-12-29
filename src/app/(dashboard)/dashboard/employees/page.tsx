import { getEmployeesList, getEmployeeStats } from '@/lib/data/employee';
import { EmployeeListTable } from '@/components/shared/EmployeeListTable';
import { EmployeeSheet } from '@/components/dashboard/employees/employee-sheet';
import { Users, Briefcase, CheckCircle, Clock, type LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { getAllTechnologies } from '@/lib/actions/technology-actions';
import { getPositionsList } from '@/lib/data/position';

export default async function EmployeesPage() {
  const [employeesData, stats, technologiesResult, positionsData] = await Promise.all([
    getEmployeesList(),
    getEmployeeStats(),
    getAllTechnologies(),
    getPositionsList(),
  ]);

  const allTechnologies =
    technologiesResult.ok && technologiesResult.data ? technologiesResult.data : [];

  const allPositions = positionsData;

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
        <EmployeeSheet allTechnologies={allTechnologies} allPositions={allPositions} />
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

      {/* Interactive table component displaying the list of employees */}
      <EmployeeListTable
        data={employeesData}
        allTechnologies={allTechnologies}
        allPositions={allPositions}
      />
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
