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
  // parse search params for nextjs 15
  const { page, query, isActive } = await searchParams;

  // setup pagination variables
  const currentPage = Math.max(1, Number(page) || 1);
  const pageSize = 10;
  const skip = (currentPage - 1) * pageSize;

  // define filter logic
  let isActiveFilter: boolean | undefined = undefined;
  if (isActive === 'true') isActiveFilter = true;
  if (isActive === 'false') isActiveFilter = false;

  const whereCondition = {
    name: query ? { contains: query, mode: 'insensitive' as const } : undefined,
    isActive: isActiveFilter,
  };

  // fetch all data in parallel
  const [
    rawServices, // table data
    filteredCount, // count for pagination
    rawPositions, // form data
    totalGlobal, // stat all
    activeGlobal, // stat active
    inactiveGlobal, // stat inactive
  ] = await Promise.all([
    // fetch paginated services
    prisma.serviceTemplate.findMany({
      orderBy: { createdAt: 'desc' },
      include: { resources: true },
      where: whereCondition,
      skip: skip,
      take: pageSize,
    }),
    // count filtered results
    prisma.serviceTemplate.count({
      where: whereCondition,
    }),
    // fetch positions
    prisma.positions.findMany({
      orderBy: { name: 'asc' },
    }),
    // global stats
    prisma.serviceTemplate.count(),
    prisma.serviceTemplate.count({ where: { isActive: true } }),
    prisma.serviceTemplate.count({ where: { isActive: false } }),
  ]);

  // calculate total pages
  const totalPages = Math.ceil(filteredCount / pageSize);

  // format positions data
  const positions = rawPositions.map((pos) => ({
    id: pos.id,
    name: pos.name,
    hourlyRate: pos.hourly_rate ? Number(pos.hourly_rate) : 0,
  }));

  // transform services data and calculate prices
  const data: ServiceTemplateDTO[] = rawServices.map((service) => {
    // calculate base cost dynamically
    const totalBaseCost = service.resources.reduce((acc, res) => {
      const hours = res.estimatedHours ? Number(res.estimatedHours) : 0;
      let rate = res.defaultUnitPrice ? Number(res.defaultUnitPrice) : 0;

      if (rate === 0 && res.positionId) {
        const pos = rawPositions.find((p) => p.id === res.positionId);
        if (pos?.hourly_rate) rate = Number(pos.hourly_rate);
      }

      return acc + hours * rate;
    }, 0);

    const marginPercent = service.defaultMargin || 0;
    const estimatedPrice = totalBaseCost + totalBaseCost * (marginPercent / 100);

    return {
      id: service.id,
      name: service.name,
      description: service.description,
      defaultMargin: marginPercent,
      isActive: service.isActive,
      estimatedPrice: Math.round(estimatedPrice),
      resources: service.resources.map((r) => ({
        id: r.id,
        label: r.label,
        positionId: r.positionId ? String(r.positionId) : null,
        estimatedHours: r.estimatedHours ? Number(r.estimatedHours) : 0,
        defaultUnitPrice: r.defaultUnitPrice ? Number(r.defaultUnitPrice) : 0,
      })),
    };
  });

  return (
    <div className="p-8 space-y-8 min-h-full bg-slate-50/50 dark:bg-[#020817]">
      {/* page header */}
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

      {/* global stats cards */}
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

      {/* table and filters section */}
      <div className="space-y-4">
        <ServiceFilters />

        <div className="bg-white dark:bg-[#0B1121] rounded-md border border-slate-200 dark:border-slate-800">
          <ServiceListTable data={data} positions={positions} />
        </div>

        {/* pagination controls */}
        <div className="mt-4 flex justify-center">
          <DataTablePagination currentPage={currentPage} totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}