import { ClientListTable } from '@/components/shared/ClientListTable';
import { DataTablePagination } from '@/components/shared/DataPagination';
import { ClientSheet } from '@/components/dashboard/clients/client-sheet';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { getClientsList } from '@/lib/data/client';

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);
  const pageSize = 10;

  const { clients, totalPages } = await getClientsList(currentPage, pageSize);

  return (
    <div className="space-y-6 p-8 bg-slate-50/50 dark:bg-[#020817] min-h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Klienci i Leady
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Zarządzaj bazą kontaktów i potencjalnych klientów.
          </p>
        </div>

        <ClientSheet>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2 cursor-pointer">
            <Plus size={18} />
            Dodaj klienta
          </Button>
        </ClientSheet>
      </div>

      <ClientListTable data={clients} />

      <div className="mt-4 flex justify-center">
        <DataTablePagination currentPage={currentPage} totalPages={totalPages} />
      </div>
    </div>
  );
}
