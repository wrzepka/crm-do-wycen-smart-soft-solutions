import { StatsGrid } from '@/components/dashboard/widgets/stats-grid';
import { RecentQuotes } from '@/components/dashboard/widgets/recent-quotes';
import { SidePanelWidgets } from '@/components/dashboard/widgets/side-panel';
import { OverviewChart } from '@/components/dashboard/widgets/overview-chart'; // Import wykresu

export default function DashboardPage() {
  const currentDate = new Date().toLocaleDateString('pl-PL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Pulpit</h1>
          <p className="text-muted-foreground text-sm capitalize">
            {currentDate}
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <StatsGrid />

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">

        {/* LEWA KOLUMNA - GŁÓWNE DANE */}
        <div className="xl:col-span-2 flex flex-col gap-6">

          {/* Wykres - Nowy element */}
          <div className="min-h-[350px]">
            <OverviewChart />
          </div>

          {/* Tabela */}
          <div className="min-h-[400px]">
            <RecentQuotes />
          </div>
        </div>

        {/* PRAWA KOLUMNA - AKCJE */}
        <div className="xl:col-span-1 sticky top-6">
          <SidePanelWidgets />
        </div>
      </div>
    </div>
  );
}