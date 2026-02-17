'use client';

import { Wallet, DollarSign, TrendingUp, Activity, LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// MOCK DATA
const mockFinancials = {
  totalRevenue: 245000.0,
  totalCost: 155000.0,
  totalMargin: 90000.0,
  avgHourlyRate: 185.0,
};

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  variant: 'blue' | 'orange' | 'emerald' | 'indigo';
}

function StatCard({ title, value, icon: Icon, variant }: StatCardProps) {
  // Style tła całej karty zamiast paska bocznego
  const styles = {
    blue: {
      cardBg: 'bg-blue-50/50 dark:bg-blue-900/10 hover:bg-blue-50 dark:hover:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    },
    orange: {
      cardBg:
        'bg-orange-50/50 dark:bg-orange-900/10 hover:bg-orange-50 dark:hover:bg-orange-900/20',
      iconColor: 'text-orange-600 dark:text-orange-400',
      iconBg: 'bg-orange-100 dark:bg-orange-900/30',
    },
    emerald: {
      cardBg:
        'bg-emerald-50/50 dark:bg-emerald-900/10 hover:bg-emerald-50 dark:hover:bg-emerald-900/20',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    },
    indigo: {
      cardBg:
        'bg-indigo-50/50 dark:bg-indigo-900/10 hover:bg-indigo-50 dark:hover:bg-indigo-900/20',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      iconBg: 'bg-indigo-100 dark:bg-indigo-900/30',
    },
  };

  const style = styles[variant];

  return (
    <Card
      className={cn(
        'border-slate-200 dark:border-slate-800 shadow-sm transition-colors',
        style.cardBg,
      )}
    >
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            {value} <span className="text-sm font-normal text-slate-400">zł</span>
          </h3>
        </div>
        <div className={cn('p-3 rounded-xl', style.iconBg, style.iconColor)}>
          <Icon size={24} />
        </div>
      </CardContent>
    </Card>
  );
}

export function StatsGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Przychód"
        value={mockFinancials.totalRevenue.toLocaleString('pl-PL')}
        icon={Wallet}
        variant="blue"
      />
      <StatCard
        title="Koszty"
        value={mockFinancials.totalCost.toLocaleString('pl-PL')}
        icon={DollarSign}
        variant="orange"
      />
      <StatCard
        title="Zysk"
        value={mockFinancials.totalMargin.toLocaleString('pl-PL')}
        icon={TrendingUp}
        variant="emerald"
      />
      <StatCard
        title="Stawka / h"
        value={mockFinancials.avgHourlyRate.toFixed(2)}
        icon={Activity}
        variant="indigo"
      />
    </div>
  );
}
