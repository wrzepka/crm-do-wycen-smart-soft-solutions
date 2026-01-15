'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCcw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard Error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-100 rounded-xl border bg-white dark:bg-[#0B1121] border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <AlertCircle className="w-12 h-12 text-destructive mb-4" />
      <h2 className="text-2xl font-bold tracking-tight mb-2 text-slate-900 dark:text-white">
        Ups... Coś poszło nie tak!
      </h2>
      <p className="text-slate-500 dark:text-slate-400 mb-6">{error.message}</p>
      <Button
        variant="default"
        onClick={() => reset()}
        className="bg-blue-600 hover:bg-blue-700 text-white gap-2 cursor-pointer"
      >
        <RefreshCcw size={18} className="w-4 h-4" />
        Spróbuj ponownie
      </Button>
    </div>
  );
}
