import { SearchBar } from '@/components/shared/search-bar';
import { FilterSelect } from '@/components/shared/filter-select';
import { ClearFiltersButton } from '@/components/shared/clear-filters-button';

const STATUS_OPTIONS = [
  { label: 'Leady', value: 'true' },
  { label: 'Klienci', value: 'false' },
];

export function ClientFilters() {
  return (
    <div className="flex flex-wrap items-end gap-4 p-4 bg-white border rounded-xl shadow-sm">
      <div className="flex-1 min-w-[200px]">
        <SearchBar queryKey="q" placeholder="Szukaj..." />
      </div>

      <FilterSelect label="Typ" queryKey="is_lead" placeholder="Każdy" options={STATUS_OPTIONS} />

      <ClearFiltersButton />
    </div>
  );
}
