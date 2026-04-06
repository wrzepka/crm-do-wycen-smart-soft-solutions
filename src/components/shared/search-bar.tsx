'use client';

import { Search as SearchIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useDebouncedCallback } from 'use-debounce';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface SearchProps {
  defaultValue: string;
  placeholder?: string;
  queryKey?: string; // Parameter name
  resetKeys?: string[]; // Things to clear after searching
}

export function SearchBar({
  defaultValue = '',
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

    // Change url without page refreshing
    replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, 300);

  return (
    <div className="relative w-full flex flex-col gap-1.5">
      <div className="h-[17px]" />
      <div className="relative">
        <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          defaultValue={defaultValue}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={placeholder}
          className="pl-8"
        />
      </div>
    </div>
  );
}
