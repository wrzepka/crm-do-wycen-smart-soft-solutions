'use client';

import { SearchBar } from '@/components/shared/search-bar';
import { FilterSelect } from '@/components/shared/filter-select';
import { ClearFiltersButton } from '@/components/shared/clear-filters-button';
import { useSearchParams } from 'next/navigation';

export function QuoteFilters() {
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || '';

  return (
    <div className="flex flex-wrap items-end gap-4 p-4 bg-white dark:bg-[#0B1121] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
      <div className="flex-1 min-w-[200px]">
        <SearchBar
          key={query}
          defaultValue={query}
          queryKey="query"
          placeholder="Szukaj po kodzie lub kliencie..."
        />
      </div>

      <FilterSelect
        label="Status"
        queryKey="status"
        placeholder="Wszystkie"
        options={[
          { label: 'Szkic', value: 'DRAFT' },
          { label: 'Wysłana', value: 'SENT' },
          { label: 'Zaakceptowana', value: 'ACCEPTED' },
          { label: 'Odrzucona', value: 'REJECTED' },
          { label: 'Anulowana', value: 'CANCELLED' },
        ]}
      />

      <ClearFiltersButton />
    </div>
  );
}
