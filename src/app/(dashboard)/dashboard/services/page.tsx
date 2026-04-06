import { prisma } from '@/lib/prisma-client';
import {
  ServiceListTable,
  ServiceTemplateDTO,
} from '@/components/dashboard/services/service-list-table';
import { ServiceSheet } from '@/components/dashboard/services/service-sheet';
import { ServiceFilters } from '@/components/dashboard/services/service-filters';
import { StatCard } from '@/components/shared/stat-card';
import { DataTablePagination } from '@/components/shared/data-pagination';
import { Box, CheckCircle, ArchiveX, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; query?: string; isActive?: string }>;
}) {
  const { page, query, isActive } = await searchParams;

  const currentPage = Math.max(1, Number(page) || 1);
  const pageSize = 10;
  const skip = (currentPage - 1) * pageSize;

  let isActiveFilter: boolean | undefined = undefined;
  if (isActive === 'true') isActiveFilter = true;
  if (isActive === 'false') isActiveFilter = false;

  const whereCondition = {
    name: query ? { contains: query, mode: 'insensitive' as const } : undefined,
    isActive: isActiveFilter,
  };

  const [rawServices, filteredCount, rawPositions, totalGlobal, activeGlobal, inactiveGlobal] =
    await Promise.all([
      prisma.serviceTemplate.findMany({
        orderBy: { updatedAt: 'desc' },
        include: { resources: true },
        where: whereCondition,
        skip: skip,
        take: pageSize,
      }),
      prisma.serviceTemplate.count({ where: whereCondition }),
      prisma.positions.findMany({ orderBy: { name: 'asc' } }),
      prisma.serviceTemplate.count(),
      prisma.serviceTemplate.count({ where: { isActive: true } }),
      prisma.serviceTemplate.count({ where: { isActive: false } }),
    ]);

  const totalPages = Math.ceil(filteredCount / pageSize);

  const positions = rawPositions.map((pos) => ({
    id: pos.id,
    name: pos.name,
    cost: pos.cost ? Number(pos.cost) : 0,
    rate: pos.rate ? Number(pos.rate) : 0,
  }));

  const data: ServiceTemplateDTO[] = rawServices.map((service) => {
    const estimatedPrice = service.resources.reduce((acc, res) => {
      const quantity = res.estimated_quantity ? Number(res.estimated_quantity) : 0;

      let unitPrice = res.price_override ? Number(res.price_override) : 0;

      if (unitPrice === 0 && res.positionId) {
        const pos = rawPositions.find((p) => p.id === res.positionId);
        if (pos?.rate) unitPrice = Number(pos.rate);
      }

      return acc + quantity * unitPrice;
    }, 0);

    return {
      id: service.id,
      name: service.name,
      description: service.description,
      defaultMargin: 0,
      isActive: service.isActive,
      estimatedPrice: Math.round(estimatedPrice),
      resources: service.resources.map((r) => ({
        id: r.id,
        label: r.label,
        positionId: r.positionId ? Number(r.positionId) : null,
        estimated_quantity: r.estimated_quantity ? Number(r.estimated_quantity) : 0,
        unit: r.unit,
        price_override: r.price_override ? Number(r.price_override) : null,
      })),
    };
  });

  return (
    <div className="p-8 space-y-8 min-h-full bg-slate-50/50 dark:bg-[#020817]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Usługi
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Zarządzaj szablonami wycen i usługami w jednym miejscu.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <ServiceSheet positions={positions}>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2 cursor-pointer shadow-sm">
              <Plus size={18} />
              Dodaj usługę
            </Button>
          </ServiceSheet>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Wszystkie Usługi"
          value={totalGlobal}
          icon={<Box className="text-slate-900 dark:text-white" />}
          description="Pozycje w katalogu"
        />
        <StatCard
          title="Aktywne"
          value={activeGlobal}
          icon={<CheckCircle className="text-emerald-600 dark:text-emerald-400" />}
          className="border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-900/10"
          description="Gotowe do użycia"
        />
        <StatCard
          title="Nieaktywne"
          value={inactiveGlobal}
          icon={<ArchiveX className="text-slate-500 dark:text-slate-400" />}
          className="border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/20 opacity-80"
          description="Szkice i zarchiwizowane"
        />
      </div>

      <div className="space-y-4">
        <ServiceFilters />

        <div className="bg-white dark:bg-[#0B1121] rounded-md border border-slate-200 dark:border-slate-800">
          <ServiceListTable data={data} positions={positions} />
        </div>

        <div className="mt-4 flex justify-center">
          <DataTablePagination currentPage={currentPage} totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}
