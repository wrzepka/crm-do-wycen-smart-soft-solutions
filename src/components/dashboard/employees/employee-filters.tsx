'use client';

import { SearchBar } from '@/components/shared/search-bar';
import { FilterSelect } from '@/components/shared/filter-select';
import { ClearFiltersButton } from '@/components/shared/clear-filters-button';
import { useSearchParams } from 'next/navigation';
import { JSX } from 'react';

interface EmployeeFiltersProps {
  statusOptions: { label: string; value: string }[];
  positionOptions: { label: string; value: string }[];
}

export function EmployeeFilters({
  statusOptions,
  positionOptions,
}: EmployeeFiltersProps): JSX.Element {
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || '';

  return (
    <div className="flex flex-wrap items-end gap-4 p-4 bg-white border rounded-xl shadow-sm">
      <div className="flex-1">
        {/* Use key and defaultValue to ensure sync with reset button*/}
        <SearchBar key={query} defaultValue={query} queryKey="query" placeholder="Szukaj..." />
      </div>

      <FilterSelect
        label="Status"
        queryKey="status"
        placeholder="Wszyscy"
        options={statusOptions}
      />

      <FilterSelect
        label="Stanowisko"
        queryKey="position"
        placeholder="Każde"
        options={positionOptions}
      />

      {/*TODO: Checkboxes with tech?*/}
      <ClearFiltersButton />
    </div>
  );
}
