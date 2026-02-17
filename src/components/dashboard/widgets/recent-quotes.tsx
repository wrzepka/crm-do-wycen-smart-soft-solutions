'use client';

import { ArrowUpRight, Clock, CheckCircle2, XCircle, FileText, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

const statusConfig: Record<string, { label: string; icon: LucideIcon; style: string }> = {
  SENT: {
    label: 'Wysłana',
    icon: Clock,
    style:
      'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
  },
  ACCEPTED: {
    label: 'Zaakceptowana',
    icon: CheckCircle2,
    style:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800',
  },
  REJECTED: {
    label: 'Odrzucona',
    icon: XCircle,
    style:
      'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
  },
  DRAFT: {
    label: 'Szkic',
    icon: FileText,
    style:
      'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
  },
};

interface Quote {
  id: number;
  client: string;
  project: string;
  amount: string;
  status: string;
  date: string;
  code: string;
}

interface RecentQuotesProps {
  data: Quote[];
}

export function RecentQuotes({ data }: RecentQuotesProps) {
  return (
    <Card className="col-span-4 lg:col-span-3">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">Ostatnie wyceny</CardTitle>
        <Button variant="ghost" size="sm" className="text-xs" asChild>
          <Link href="/dashboard/quotes">
            Wszystkie <ArrowUpRight className="ml-2 h-3 w-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">Brak ostatnich wycen.</p>
          ) : (
            data.map((quote) => {
              const config = statusConfig[quote.status] || statusConfig['DRAFT'];
              const Icon = config.icon;

              return (
                <Link
                  href={`/dashboard/quotes/${quote.id}/edit`}
                  key={quote.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-transparent hover:border-slate-100 dark:hover:border-slate-800"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {quote.client}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-1 rounded">
                          {quote.code}
                        </span>
                        <span className="text-xs text-slate-500 truncate max-w-[150px] sm:max-w-[200px]">
                          {quote.project}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 hidden sm:block">
                      {quote.amount}
                    </span>
                    <Badge
                      variant="outline"
                      className={`gap-1 px-2 py-0.5 text-[10px] border ${config.style}`}
                    >
                      <Icon className="h-3 w-3" />
                      {config.label}
                    </Badge>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
