import { getPositions } from '@/lib/data/position';
import { PositionListTable } from '@/components/dashboard/positions/position-list-table';
import { PositionSheet } from '@/components/dashboard/positions/position-sheet';
import { PositionFilters } from '@/components/dashboard/positions/position-filters';
import { DataTablePagination } from '@/components/shared/data-pagination';

export default async function PositionsPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; page?: string }>;
}) {
  const { page, query } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);
  const searchQuery = query || '';
  const pageSize = 25;

  // fetch raw data directly from backend (hourly_rate is decimal)
  const { positions: rawPositions, totalPages } = await getPositions(
    searchQuery,
    currentPage,
    pageSize,
  );

  // transformation: converting decimal to number so next.js can send data to client
  const formattedPositions = rawPositions.map((pos) => ({
    ...pos,
    rate: pos.rate ? pos.rate.toNumber() : 0,
    cost: pos.cost ? pos.cost.toNumber() : 0,
  }));

  return (
    <div className="space-y-6 p-8 bg-slate-50/50 dark:bg-[#020817] min-h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Stanowiska
          </h2>
          <p className="text-muted-foreground mt-1">
            Definiuj role i stanowiska dostępne w organizacji.
          </p>
        </div>

        <PositionSheet />
      </div>

      <PositionFilters />

      {/* passing processed data (with number instead of decimal) */}
      <PositionListTable data={formattedPositions} />

      <div className="mt-4 flex justify-center">
        <DataTablePagination currentPage={currentPage} totalPages={totalPages} />
      </div>
    </div>
  );
}
