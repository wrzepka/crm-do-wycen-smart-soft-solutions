import { TechnologyListTable } from '@/components/dashboard/technologies/technology-list-table';
import { TechnologySheet } from '@/components/dashboard/technologies/technology-sheet';
import { getTechnologiesWithCount } from '@/lib/data/technology';

export default async function TechnologiesPage() {
  const technologies = await getTechnologiesWithCount();

  return (
    <div className="p-8 space-y-8 min-h-full bg-slate-50/50 dark:bg-[#020817]">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Technologie
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Zarządzaj listą technologii i języków programowania.
          </p>
        </div>
        <TechnologySheet />
      </div>

      {/* Main Content */}
      <TechnologyListTable data={technologies} />
    </div>
  );
}
