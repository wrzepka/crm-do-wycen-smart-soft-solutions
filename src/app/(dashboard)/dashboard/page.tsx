import { StatsGrid } from '@/components/dashboard/widgets/stats-grid';
import { RecentQuotes } from '@/components/dashboard/widgets/recent-quotes';
import { QuickActions, ActivitiesList } from '@/components/dashboard/widgets/side-panel';

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Pulpit nawigacyjny</h1>
        <p className="text-muted-foreground mt-1">Przegląd ofertowania i statusy projektów.</p>
      </div>

      {/* KPI Stats Widgets */}
      <StatsGrid />

      {/* Main Content: Responsive Grid (1 col mobile, 3 cols desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Table) - takes 2/3 of width on desktop */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <RecentQuotes />
        </div>

        {/* Right Column (Panels) - takes 1/3 of width on desktop */}
        <div className="flex flex-col gap-6">
          <QuickActions />
          <ActivitiesList />
        </div>
      </div>
    </div>
  );
}