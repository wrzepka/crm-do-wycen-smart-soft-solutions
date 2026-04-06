'use client';

import { SearchBar } from '@/components/shared/search-bar';
import { ClearFiltersButton } from '@/components/shared/clear-filters-button';
import { useSearchParams } from 'next/navigation';

export function TechnologyFilters() {
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || '';

  return (
    <div className="flex flex-wrap items-end gap-4 p-4 bg-white border rounded-xl shadow-sm">
      <div className="flex-1">
        {/* Use key and defaultValue to ensure sync with reset button*/}
        <SearchBar key={query} defaultValue={query} queryKey="query" placeholder="Szukaj..." />
      </div>

      <ClearFiltersButton />
    </div>
  );
}
