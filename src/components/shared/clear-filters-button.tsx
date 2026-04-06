'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export function ClearFiltersButton() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  // If there is no parameters do not render button component
  if (searchParams.size === 0) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      onClick={() => replace(pathname, { scroll: false })}
      className="h-9 px-2 text-muted-foreground hover:text-destructive hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer"
    >
      <X className="mr-2 h-4 w-4" />
      Wyczyść filtry
    </Button>
  );
}
