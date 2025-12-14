'use client';

import { Menu, BellRing } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DashboardHeader() {
  return (
    <header className="flex h-16 flex-shrink-0 items-center justify-between bg-white px-6 border-b border-border shadow-sm z-10">
      <div className="flex items-center gap-4">
        {/* Mobile toggle button - visible only on small screens */}
        <Button variant="ghost" size="icon" className="md:hidden text-slate-600">
          <Menu className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold text-foreground hidden sm:block">Pulpit Managera</h2>
      </div>

      <div className="flex items-center gap-5">
        <button className="text-muted-foreground hover:text-primary transition-colors relative">
          <BellRing size={20} />
          {/* Notification dot */}
          <span className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-white"></span>
        </button>

        <div className="h-8 w-[1px] bg-border"></div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-foreground leading-none">Wiktor Tomczyk</p>
            <p className="text-xs text-muted-foreground mt-1">Manager</p>
          </div>
          <div className="h-9 w-9 rounded-full bg-blue-100 border border-blue-200 text-blue-700 font-bold flex items-center justify-center text-sm">
            WT
          </div>
        </div>
      </div>
    </header>
  );
}
