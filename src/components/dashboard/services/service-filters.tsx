'use client';

import { SearchBar } from '@/components/shared/search-bar';
import { FilterSelect } from '@/components/shared/filter-select';
import { ClearFiltersButton } from '@/components/shared/clear-filters-button';
import { useSearchParams } from 'next/navigation';

export function ServiceFilters() {
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || '';

  return (
    <div className="flex flex-wrap items-end gap-4 p-4 bg-white dark:bg-[#0B1121] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
      <div className="flex-1">
        <SearchBar key={query} defaultValue={query} queryKey="query" placeholder="Szukaj..." />
      </div>

      <FilterSelect
        label="Typ rozliczenia"
        queryKey="billingType"
        placeholder="Wszystkie"
        options={[
          { label: 'Time & Material', value: 'TIME_MATERIAL' },
          { label: 'Stała cena', value: 'FIXED_PRICE' },
          { label: 'Subskrypcja', value: 'SUBSCRIPTION' },
        ]}
      />

      <FilterSelect
        label="Status"
        queryKey="status"
        placeholder="Każdy"
        options={[
          { label: 'Szkic', value: 'DRAFT' },
          { label: 'Aktywna', value: 'ACTIVE' },
          { label: 'Archiwum', value: 'ARCHIVED' },
        ]}
      />

      <ClearFiltersButton />
    </div>
  );
}
