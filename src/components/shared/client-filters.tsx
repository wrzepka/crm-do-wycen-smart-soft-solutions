'use client';

import { SearchBar } from '@/components/shared/search-bar';
import { FilterSelect } from '@/components/shared/filter-select';
import { ClearFiltersButton } from '@/components/shared/clear-filters-button';
import { useSearchParams } from 'next/navigation';

const STATUS_OPTIONS = [
  { label: 'Leady', value: 'true' },
  { label: 'Klienci', value: 'false' },
];

export function ClientFilters() {
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || '';

  return (
    <div className="flex flex-wrap items-end gap-4 p-4 bg-white border rounded-xl shadow-sm">
      <div className="flex-1">
        {/* Use key and defaultValue to ensure sync with reset button*/}
        <SearchBar key={query} defaultValue={query} queryKey="query" placeholder="Szukaj..." />
      </div>

      <FilterSelect label="Typ" queryKey="is_lead" placeholder="Każdy" options={STATUS_OPTIONS} />

      <ClearFiltersButton />
    </div>
  );
}
