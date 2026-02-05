'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  FileText,
  Settings,
  LogOut,
  PieChart,
  Layers,
  Cpu,
  BriefcaseBusiness,
  LucideIcon,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTransition } from 'react';
import { logoutAction } from '@/lib/actions/logout';
import { toast } from 'sonner';

interface SidebarLinkProps {
  href: string;
  icon: LucideIcon;
  label: string;
}

function SidebarLink({ href, icon: Icon, label }: SidebarLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
        isActive
          ? 'bg-primary text-primary-foreground shadow-md shadow-blue-900/20'
          : 'text-slate-400 hover:bg-white/5 hover:text-white',
      )}
    >
      <Icon
        size={18}
        className={cn('transition-transform duration-200', !isActive && 'group-hover:scale-105')}
      />
      <span>{label}</span>
    </Link>
  );
}

export function DashboardSidebar() {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      const result = await logoutAction();
      if (result?.error) {
        toast.error(result.error);
      }
    });
  };

  return (
    <aside className="hidden w-72 flex-col h-full bg-[#0B1121] text-white md:flex flex-shrink-0 relative z-20 border-r border-white/5">
      {/* Header with Logo */}
      <div className="flex h-16 items-center px-6 border-b border-white/5 bg-[#0B1121] sticky top-0 z-10 overflow-hidden">
        <div className="flex items-center gap-3 w-full">
          <div className="relative h-14 w-auto min-w-[50px] flex-shrink-0">
            <Image
              src="/logo.png"
              alt="Logo"
              width={90}
              height={56}
              className="object-contain h-full w-auto"
              priority
            />
          </div>

          <div className="flex flex-col min-w-0 justify-center">
            <span className="block font-bold text-white tracking-tight leading-none text-base truncate">
              Smart Soft
            </span>
            <span className="text-xs uppercase tracking-wider text-blue-400 font-semibold mt-1">
              CRM
            </span>
          </div>
        </div>
      </div>

      {/* Scrollable navigation area
       */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 sidebar-scrollbar">
        <div>
          <div className="px-3 mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">

          </div>
          <div className="space-y-1">
            <SidebarLink href="/dashboard" icon={LayoutDashboard} label="Pulpit" />
          </div>
        </div>

        <div>
          <div className="px-3 mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
            Sprzedaż i Projekty
          </div>
          <div className="space-y-1">
            <SidebarLink href="/dashboard/quotes" icon={FileText} label="Wyceny i Oferty" />
            <SidebarLink href="/dashboard/projects" icon={Briefcase} label="Projekty" />
            <SidebarLink href="/dashboard/services" icon={Layers} label="Usługi" />
          </div>
        </div>

        <div>
          <div className="px-3 mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
            Organizacja
          </div>
          <div className="space-y-1">
            <SidebarLink href="/dashboard/clients" icon={Building2} label="Klienci i Leady" />
            <SidebarLink href="/dashboard/employees" icon={Users} label="Pracownicy" />
          </div>
        </div>

        <div>
          <div className="px-3 mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
            Katalogi
          </div>
          <div className="space-y-1">
            <SidebarLink href="/dashboard/positions" icon={BriefcaseBusiness} label="Stanowiska" />
            <SidebarLink href="/dashboard/technologies" icon={Cpu} label="Technologie" />
          </div>
        </div>

        <div>
          <div className="px-3 mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
            Raporty
          </div>
          <div className="space-y-1">
            <SidebarLink href="/dashboard/reports" icon={PieChart} label="Raporty Skuteczności" />
          </div>
        </div>
      </div>

      {/* Bottom section (Settings/Logout) */}
      <div className="p-4 border-t border-white/5 bg-[#0B1121]">
        <SidebarLink href="/settings" icon={Settings} label="Ustawienia" />
        <button
          onClick={handleLogout}
          disabled={isPending}
          className="mt-2 w-full group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
        >
          {isPending ? <Loader2 size={18} className="animate-spin" /> : <LogOut size={18} />}
          <span>{isPending ? 'Wylogowywanie...' : 'Wyloguj się'}</span>
        </button>
      </div>
    </aside>
  );
}
