import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { DashboardHeader } from '@/components/dashboard/header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full bg-muted/20 overflow-hidden">
      {/* Sidebar (desktop only) */}
      <DashboardSidebar />

      {/* Main content area (including header) */}
      <div className="flex flex-1 flex-col h-full overflow-hidden relative">
        <DashboardHeader />

        {/* Scrollable container for page content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
