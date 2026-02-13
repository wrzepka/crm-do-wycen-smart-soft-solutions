'use client';

import { Plus, Users, LayoutTemplate, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// MOCK DATA - Odpowiada funkcji getMostProfitService / getMostSoldService
const topServices = [
  {
    name: 'Wdrożenia ERP',
    quantity: 12, // ilość sprzedaży
    totalNet: '45 000', // przychód z usługi
    color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400'
  },
  {
    name: 'Konsultacje IT',
    quantity: 24,
    totalNet: '28 500',
    color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400'
  },
  {
    name: 'Audyt Bezpieczeństwa',
    quantity: 5,
    totalNet: '15 000',
    color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400'
  }
];

export function SidePanelWidgets() {
  return (
    <div className="space-y-6">

      {/* SZYBKIE AKCJE - Niebieski Gradient */}
      <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white border-none shadow-md">
        <CardContent className="p-6">
          <h3 className="text-lg font-bold mb-2">Szybkie akcje</h3>
          <p className="text-blue-100 text-sm mb-6 opacity-90">
            Zarządzaj swoimi wycenami i klientami.
          </p>

          <div className="space-y-3">
            <Button
              asChild
              className="w-full bg-white text-blue-700 hover:bg-blue-50 border-0 font-semibold h-10 shadow-sm"
            >
              <Link href="/dashboard/quotes/new">
                <Plus className="mr-2 h-4 w-4" /> Nowa Wycena
              </Link>
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" asChild className="border-white/20 hover:bg-white/10 text-white hover:text-white bg-transparent h-10 border">
                <Link href="/dashboard/clients">
                  <Users className="mr-2 h-4 w-4" /> Klient
                </Link>
              </Button>
              <Button variant="outline" asChild className="border-white/20 hover:bg-white/10 text-white hover:text-white bg-transparent h-10 border">
                <Link href="/dashboard/services">
                  <LayoutTemplate className="mr-2 h-4 w-4" /> Usługa
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* TOP USŁUGI */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1121]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Top Usługi</CardTitle>
            <Trophy className="h-4 w-4 text-amber-500" />
          </div>
          <CardDescription>Najlepsze wyniki sprzedażowe</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topServices.map((service, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className={cn("flex items-center justify-center w-8 h-8 rounded-md text-xs font-bold", service.color)}>
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{service.name}</p>
                    <p className="text-xs text-slate-500">{service.quantity} sprzedaży</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  {service.totalNet} zł
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}