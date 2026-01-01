'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FilterSelectProps {
  queryKey: string;
  placeholder: string;
  options: { label: string; value: string }[];
  resetKeys?: string[];
}

export function FilterSelect({
  queryKey,
  placeholder,
  options,
  resetKeys = ['page'],
}: FilterSelectProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSelect = (selectedValue: string) => {
    const params = new URLSearchParams(searchParams);

    if (selectedValue && selectedValue !== 'all') {
      params.set(queryKey, selectedValue);
    } else {
      params.delete(queryKey);
    }

    // Clear all keys from resetKeys array
    // e.g. reset page parameter
    resetKeys.forEach((key) => params.delete(key));

    // change url without page refreshing
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <Select onValueChange={handleSelect} defaultValue={searchParams.get(queryKey) || 'all'}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Wszystkie</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
