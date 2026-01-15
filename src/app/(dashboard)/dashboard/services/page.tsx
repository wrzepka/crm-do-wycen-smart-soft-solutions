'use client';

import { ServiceListTable, ServiceMock } from '@/components/dashboard/services/service-list-table';
import { ServiceSheet } from '@/components/dashboard/services/service-sheet';
import { ServiceFilters } from '@/components/dashboard/services/service-filters';
import { StatCard } from '@/components/shared/stat-card';
import { Box, Layers, CreditCard, CheckCircle } from 'lucide-react';

const MOCK_SERVICES: ServiceMock[] = [
  {
    id: '1',
    name: 'Senior Backend Developer (Python)',
    billingType: 'TIME_MATERIAL',
    categoryId: '1',
    description: 'Starszy programista backend, stack Python/Django/FastAPI.',
    basePrice: 0,
    finalPrice: 280,
    unit: 'h',
    status: 'ACTIVE',
  },
  {
    id: '2',
    name: 'Licencja CRM - Enterprise',
    billingType: 'SUBSCRIPTION',
    categoryId: '1',
    description: 'Miesięczny dostęp do platformy dla firm > 50 osób.',
    basePrice: 2500,
    unit: 'msc',
    status: 'ACTIVE',
  },
  {
    id: '3',
    name: 'Warsztaty Discovery (UX/UI)',
    billingType: 'FIXED_PRICE',
    categoryId: '2',
    description: 'Kompletna analiza wymagań i makiety low-fidelity.',
    basePrice: 5000,
    unit: 'kpl.',
    status: 'ACTIVE',
  },
  {
    id: '4',
    name: 'Konsultacje DevOps',
    billingType: 'TIME_MATERIAL',
    categoryId: '3',
    description: 'Wsparcie w konfiguracji CI/CD i chmury AWS.',
    basePrice: 0,
    finalPrice: 350,
    unit: 'h',
    status: 'DRAFT',
  },
  {
    id: '5',
    name: 'Hosting VPS Standard',
    billingType: 'SUBSCRIPTION',
    categoryId: '3',
    description: 'Utrzymanie serwera wirtualnego (4 vCPU, 8GB RAM).',
    basePrice: 200,
    unit: 'msc',
    status: 'ACTIVE',
  },
];

export default function ServicesPage() {
  const stats = {
    total: MOCK_SERVICES.length,
    timeMaterial: MOCK_SERVICES.filter((s) => s.billingType === 'TIME_MATERIAL').length,
    fixed: MOCK_SERVICES.filter(
      (s) => s.billingType === 'FIXED_PRICE' || s.billingType === 'SUBSCRIPTION',
    ).length,
    active: MOCK_SERVICES.filter((s) => s.status === 'ACTIVE').length,
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Katalog Usług
          </h2>
          <p className="text-muted-foreground text-slate-500">
            Zarządzaj usługami, stawkami i produktami w jednym miejscu.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <ServiceSheet />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Wszystkie Usługi"
          value={stats.total}
          icon={<Box className="text-slate-900 dark:text-white" />}
          description="Pozycje w katalogu"
        />
        <StatCard
          title="Aktywne"
          value={stats.active}
          icon={<CheckCircle className="text-emerald-600 dark:text-white" />}
          className="border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-900/10"
          description="Gotowe do ofertowania"
        />
        <StatCard
          title="Role (T&M)"
          value={stats.timeMaterial}
          icon={<Layers className="text-blue-600 dark:text-white" />}
          description="Rozliczane godzinowo"
        />
        <StatCard
          title="Produkty / Abo"
          value={stats.fixed}
          icon={<CreditCard className="text-purple-600 dark:text-white" />}
          className="border-purple-200 dark:border-purple-900/50 bg-purple-50/50 dark:bg-purple-900/10"
          description="Stała cena i subskrypcje"
        />
      </div>

      <ServiceFilters />
      <ServiceListTable data={MOCK_SERVICES} />
    </div>
  );
}
