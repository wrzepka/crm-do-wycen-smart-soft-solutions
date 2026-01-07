import { getPositions } from '@/lib/data/position';
import { PositionListTable } from '@/components/dashboard/positions/position-list-table';
import { PositionSheet } from '@/components/dashboard/positions/position-sheet';

export default async function PositionsPage() {
  // fetch raw data directly from backend (hourly_rate is decimal)
  const rawPositions = await getPositions();

  // transformation: converting decimal to number so next.js can send data to client
  const formattedPositions = rawPositions.map((pos) => ({
    ...pos,
    hourly_rate: pos.hourly_rate ? pos.hourly_rate.toNumber() : null,
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

      {/* passing processed data (with number instead of decimal) */}
      <PositionListTable data={formattedPositions} />
    </div>
  );
}
