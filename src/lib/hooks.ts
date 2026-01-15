'use-client';

import { useSearchParams } from 'next/navigation';

export function useIsFiltered(filterKeys: string[] = ['query', 'status']) {
  const searchParams = useSearchParams();

  const isFiltered = filterKeys.some((key) => {
    const value = searchParams.get(key);
    return value !== null && value !== '';
  });

  return isFiltered;
}
