import { TechnologyListTable } from '@/components/dashboard/technologies/technology-list-table';
import { TechnologySheet } from '@/components/dashboard/technologies/technology-sheet';
import { getTechnologiesWithCount } from '@/lib/data/technology';
import { TechnologyFilters } from '@/components/dashboard/technologies/technology-filters';
import { DataTablePagination } from '@/components/shared/data-pagination';

export default async function TechnologiesPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; page?: string }>;
}) {
  const { query, page } = await searchParams;
  const searchQuery = query || '';
  const currentPage = Math.max(1, Number(page) || 1);
  const pageSize = 25;

  const { technologiesList: technologies, totalPages } = await getTechnologiesWithCount(
    searchQuery,
    currentPage,
    pageSize,
  );

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

      <TechnologyFilters />

      {/* Main Content */}
      <TechnologyListTable data={technologies} />

      <div className="mt-4 flex justify-center">
        <DataTablePagination currentPage={currentPage} totalPages={totalPages} />
      </div>
    </div>
  );
}
