'use client';

import { ArrowUpRight, Clock, CheckCircle2, XCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

// Helper do mapowania statusów
const statusConfig: Record<string, { label: string; icon: any; style: string }> = {
  SENT: {
    label: 'Wysłana',
    icon: Clock,
    style: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
  },
  ACCEPTED: {
    label: 'Zaakceptowana',
    icon: CheckCircle2,
    style: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'
  },
  REJECTED: {
    label: 'Odrzucona',
    icon: XCircle,
    style: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
  },
  DRAFT: {
    label: 'Szkic',
    icon: FileText,
    style: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
  }
};

const recentQuotes = [
  {
    id: 1,
    code: 'OFERTA/2025/001',
    client: 'TechCorp Sp. z o.o.',
    project: 'System ERP',
    amount: '45 000 zł',
    date: 'Dzisiaj',
    status: 'SENT',
  },
  {
    id: 2,
    code: 'OFERTA/2025/002',
    client: 'Kancelaria Lex',
    project: 'Strona WWW',
    amount: '12 500 zł',
    date: 'Wczoraj',
    status: 'DRAFT',
  },
  {
    id: 3,
    code: 'OFERTA/2025/003',
    client: 'Logistics Pro',
    project: 'App Mobilna',
    amount: '85 000 zł',
    date: '12 Lut',
    status: 'ACCEPTED',
  },
  {
    id: 4,
    code: 'OFERTA/2025/004',
    client: 'Eco Energy',
    project: 'Audyt',
    amount: '8 000 zł',
    date: '10 Lut',
    status: 'REJECTED',
  },
];

export function RecentQuotes() {
  return (
    <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1121] h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between py-4">
        <CardTitle className="text-base font-bold">Ostatnie Wyceny</CardTitle>
        <Button variant="ghost" size="sm" asChild className="text-xs h-8">
          <Link href="/dashboard/quotes">Zobacz wszystkie <ArrowUpRight className="ml-1 h-3 w-3" /></Link>
        </Button>
      </CardHeader>
      <CardContent className="flex-1 pb-2">
        <div className="space-y-1">
          {recentQuotes.map((quote) => {
            const config = statusConfig[quote.status] || statusConfig.DRAFT;
            const Icon = config.icon;

            return (
              <Link
                key={quote.id}
                href={`/dashboard/quotes/${quote.id}/edit`}
                className="flex items-center justify-between p-3 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group border border-transparent hover:border-slate-100 dark:hover:border-slate-800"
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
                  <Badge variant="outline" className={`gap-1 px-2 py-0.5 text-[10px] border ${config.style}`}>
                    <Icon className="h-3 w-3" />
                    {config.label}
                  </Badge>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}