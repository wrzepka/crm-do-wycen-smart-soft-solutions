import { getPositionsList } from '@/lib/data/position';
import { PositionListTable } from '@/components/shared/PositionListTable';
import { PositionSheet } from '@/components/dashboard/positions/position-sheet';

export default async function PositionsPage() {
  // 1. Pobieramy prawdziwe dane z bazy
  const positionsData = await getPositionsList();

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

        {/* 2. Przycisk dodawania */}
        <PositionSheet />
      </div>

      {/* 3. Tabela z danymi */}
      <PositionListTable data={positionsData} />
    </div>
  );
}
