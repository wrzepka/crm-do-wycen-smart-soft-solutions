import { StatsGrid } from '@/components/dashboard/widgets/stats-grid';
import { RecentQuotes } from '@/components/dashboard/widgets/recent-quotes';
import { SidePanelWidgets } from '@/components/dashboard/widgets/side-panel';
import { OverviewChart } from '@/components/dashboard/widgets/overview-chart';
import { prisma } from '@/lib/prisma-client';
import { formatCurrency } from '@/lib/utils';

export default async function DashboardPage() {
  const currentDate = new Date().toLocaleDateString('pl-PL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const quotesRaw = await prisma.pricing_history.findMany({
    take: 5,
    orderBy: {
      quote_date: 'desc',
    },
    where: {
      is_current_version: true,
    },
    include: {
      client: true,
      project: {
        include: {
          project_details: true,
        },
      },
    },
  });

  const recentQuotes = quotesRaw.map((quote) => {
    const projectName = quote.project?.project_details?.[0]?.project_name || 'Bez projektu';

    return {
      id: quote.id,
      client: `${quote.client.first_name} ${quote.client.last_name}`,
      project: projectName,
      amount: formatCurrency(Number(quote.total_gross)),
      status: quote.status,
      date: quote.quote_date.toISOString(),
      code: quote.quote_code || `#${quote.id}`,
    };
  });

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Pulpit</h1>
          <p className="text-muted-foreground text-sm capitalize">{currentDate}</p>
        </div>
      </div>

      {/* KPI Stats */}
      <StatsGrid />

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <div className="xl:col-span-2 flex flex-col gap-6">
          {/* Chart */}
          <div className="min-h-[350px]">
            <OverviewChart />
          </div>

          {/* Table */}
          <div className="min-h-[400px]">
            <RecentQuotes data={recentQuotes} />
          </div>
        </div>

        {/* RIGHT COLUMN - ACTIONS */}
        <div className="xl:col-span-1 sticky top-6">
          <SidePanelWidgets />
        </div>
      </div>
    </div>
  );
}
