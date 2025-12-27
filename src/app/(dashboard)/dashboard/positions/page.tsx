import { PositionListTable } from '@/components/shared/PositionListTable';
import { positions } from '@/generated/prisma/client';

// Mock data for testing purposes
const mockPositions: positions[] = [
  {
    id: 1,
    name: 'Senior Developer',
  },
  {
    id: 2,
    name: 'Junior Developer',
  },
  {
    id: 3,
    name: 'Scrum Master',
  },
  {
    id: 4,
    name: 'UI/UX Designer',
  },
];

export default async function ClientsPage() {
  // after tests: const data = await getPositionList();
  const data = mockPositions;

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Stanowiska
          </h2>
          <p className="text-muted-foreground">Zarządzaj stanowiskami.</p>
        </div>
      </div>

      <PositionListTable data={data} />
    </div>
  );
}
