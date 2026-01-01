'use client';

import { Search as SearchIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useDebouncedCallback } from 'use-debounce';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface SearchProps {
  placeholder?: string;
  queryKey?: string; // Parameter name
  resetKeys?: string[]; // Things to clear after searching
}

export function Search({
  placeholder = 'Szukaj...',
  queryKey = 'query',
  resetKeys = ['page'],
}: SearchProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  // Delay execution by 300ms to prevent excessive database queries while typing.
  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);

    if (term) {
      params.set(queryKey, term);
    } else {
      params.delete(queryKey);
    }

    // Clear all keys from resetKeys array
    // e.g. reset page parameter
    resetKeys.forEach((key) => params.delete(key));

    // change url without page refreshing
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  // generate component
  return (
    <div className="relative flex flex-1">
      <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        className="pl-10"
        onChange={(e) => handleSearch(e.target.value)}
        defaultValue={searchParams.get(queryKey)?.toString()}
      />
    </div>
  );
}
