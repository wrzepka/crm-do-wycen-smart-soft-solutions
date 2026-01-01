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
    <div className="flex flex-col gap-1.5">
      {label && <Label className="text-xs font-semibold text-muted-foreground ml-1">{label}</Label>}
      <Select onValueChange={handleSelect} defaultValue={searchParams.get(queryKey) || 'all'}>
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
