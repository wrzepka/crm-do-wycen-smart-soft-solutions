'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface FilterSelectProps {
  label?: string;
  queryKey: string;
  placeholder: string;
  options: { label: string; value: string }[];
  resetKeys?: string[];
}

export function FilterSelect({
  label,
  queryKey,
  placeholder,
  options,
  resetKeys = ['page'],
}: FilterSelectProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  // Get actual URL values. If it is empty set it to 'all'
  // It is important for sync with filter form
  const currentValue = searchParams.get(queryKey) || 'all';

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

    // Change url without page refreshing
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-1.5">
      {label && <Label>{label}</Label>}
      {/* Value is used here to ensure sync after clicking reset button (Selected value will be same as value from URL or default one)*/}
      <Select value={currentValue} onValueChange={handleSelect}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Każdy</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
