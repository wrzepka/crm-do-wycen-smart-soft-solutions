'use client';

import { Card, CardContent } from '@/components/ui/card';
import { ReactNode } from 'react';

// Interface defining the expected props for the StatCard component
interface StatCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  description: string;
  className?: string;
}

// Reusable component for rendering individual statistic cards
export function StatCard({ title, value, icon, description, className }: StatCardProps) {
  return (
    <Card className={`border-slate-200 dark:border-slate-800 shadow-sm ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          {icon}
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{value}</div>
          <p className="text-xs text-slate-400 dark:text-slate-500">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
