import Link from 'next/link';
import { prisma } from '@/lib/prisma-client';
import { QuoteListTable } from '@/components/dashboard/quotes/quote-list-table';
import { QuoteFilters } from '@/components/dashboard/quotes/quote-filters';
import { StatCard } from '@/components/shared/stat-card';
import { DataTablePagination } from '@/components/shared/data-pagination';
import { FileStack, Send, Pencil, Plus, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuoteStatus } from '@/types/pricing';

export default async function QuotesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; query?: string; status?: string }>;
}) {
  const { page, query, status } = await searchParams;

  const currentPage = Math.max(1, Number(page) || 1);
  const pageSize = 10;
  const skip = (currentPage - 1) * pageSize;

  // Budowanie warunku filtrowania
  const whereCondition = {
    is_current_version: true,
    status: status && status !== 'all' ? (status as QuoteStatus) : undefined,
    OR: query
      ? [
        { quote_code: { contains: query, mode: 'insensitive' as const } },
        { client: { first_name: { contains: query, mode: 'insensitive' as const } } },
        { client: { last_name: { contains: query, mode: 'insensitive' as const } } },
        { project: { project_details: { some: { project_name: { contains: query, mode: 'insensitive' as const } } } } }
      ]
      : undefined,
  };

  // Równoległe pobieranie danych i statystyk
  const [
    rawQuotes,
    filteredCount,
    totalGlobal,
    draftGlobal,
    sentGlobal,
    acceptedGlobal,
  ] = await Promise.all([
    prisma.pricing_history.findMany({
      where: whereCondition,
      orderBy: { id: 'desc' },
      skip: skip,
      take: pageSize,
      include: {
        client: true,
        project: {
          include: {
            project_details: true,
          },
        },
      },
    }),
    prisma.pricing_history.count({ where: whereCondition }),
    prisma.pricing_history.count({ where: { is_current_version: true } }),
    prisma.pricing_history.count({ where: { is_current_version: true, status: 'DRAFT' } }),
    prisma.pricing_history.count({ where: { is_current_version: true, status: 'SENT' } }),
    prisma.pricing_history.count({ where: { is_current_version: true, status: 'ACCEPTED' } }),
  ]);

  // NAPRAWA: Konwersja obiektów Decimal na number (lub null) dla komponentu klienckiego
  const serializedQuotes = rawQuotes.map((quote) => ({
    ...quote,
    subtotal_net: quote.subtotal_net.toNumber(),
    discount: quote.discount.toNumber(),
    total_net: quote.total_net.toNumber(),
    total_gross: quote.total_gross.toNumber(),
    total_cost: quote.total_cost.toNumber(),
    // Konwertujemy też zagnieżdżone pola w project_details, jeśli istnieją
    project: quote.project ? {
      ...quote.project,
      project_details: quote.project.project_details.map(pd => ({
        ...pd,
        estimated_hours: pd.estimated_hours?.toNumber() ?? null,
        estimated_price: pd.estimated_price?.toNumber() ?? null,
      }))
    } : null
  }));

  const totalPages = Math.ceil(filteredCount / pageSize);

  return (
    <div className="p-8 space-y-8 min-h-full bg-slate-50/50 dark:bg-[#020817]">
      {/* Sekcja Nagłówka */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Oferty
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Zarządzaj wycenami i monitoruj statusy ofert.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white gap-2 cursor-pointer shadow-sm">
            <Link href="/dashboard/quotes/new">
              <Plus size={18} />
              Nowa wycena
            </Link>
          </Button>
        </div>
      </div>

      {/* Karty KPI (Statystyki) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Wszystkie"
          value={totalGlobal}
          icon={<FileStack className="text-slate-900 dark:text-white" />}
          description="Ofert w bazie"
        />
        <StatCard
          title="Szkice"
          value={draftGlobal}
          icon={<Pencil className="text-slate-500 dark:text-slate-400" />}
          className="border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/20 opacity-80"
          description="W przygotowaniu"
        />
        <StatCard
          title="Wysłane"
          value={sentGlobal}
          icon={<Send className="text-blue-600 dark:text-blue-400" />}
          className="border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-900/10"
          description="Oczekujące na decyzję"
        />
        <StatCard
          title="Zaakceptowane"
          value={acceptedGlobal}
          icon={<CheckCircle className="text-emerald-600 dark:text-emerald-400" />}
          className="border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-900/10"
          description="Przyjęte przez klientów"
        />
      </div>

      {/* Sekcja Danych */}
      <div className="space-y-4">
        <QuoteFilters />

        <div className="bg-white dark:bg-[#0B1121] rounded-md border border-slate-200 dark:border-slate-800">
          {/* Używamy serializedQuotes zamiast rawQuotes */}
          <QuoteListTable data={serializedQuotes} />
        </div>

        <div className="mt-4 flex justify-center">
          <DataTablePagination currentPage={currentPage} totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}