import { TrendingUp, FileCheck, FileText, Users, ArrowUpRight, LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  colorClass: string; // Tailwind classes for dynamic coloring
}

function StatCard({ title, value, change, icon: Icon, colorClass }: StatCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="mt-2 text-2xl font-bold tracking-tight">{value}</h3>
          </div>
          {/* Dynamic icon background */}
          <div className={cn('p-3 rounded-lg', colorClass)}>
            <Icon size={20} />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-sm">
          <span className="flex items-center font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded text-xs">
            <ArrowUpRight size={14} className="mr-1" />
            {change}
          </span>
          <span className="text-muted-foreground text-xs">vs ostatni miesiąc</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function StatsGrid() {
  return (
    // Responsive grid: 1 col (mobile) -> 2 cols (tablet) -> 4 cols (desktop)
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Wartość Ofert (Pipeline)"
        value="142 500 zł"
        change="+12%"
        icon={TrendingUp}
        colorClass="bg-blue-500/10 text-blue-600"
      />
      <StatCard
        title="Skuteczność (Win Rate)"
        value="38%"
        change="+2.5%"
        icon={FileCheck}
        colorClass="bg-emerald-500/10 text-emerald-600"
      />
      {/* ... other cards ... */}
      <StatCard
        title="Otwarte Wyceny"
        value="8"
        change="+2"
        icon={FileText}
        colorClass="bg-indigo-500/10 text-indigo-600"
      />
      <StatCard
        title="Nowe Leady"
        value="12"
        change="+4"
        icon={Users}
        colorClass="bg-amber-500/10 text-amber-600"
      />
    </div>
  );
}
