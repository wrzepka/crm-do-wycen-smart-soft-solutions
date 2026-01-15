'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, Box, Users, RefreshCw } from 'lucide-react';
import { ServiceSheet } from './service-sheet';

export interface ServiceMock {
  id: string;
  name: string;
  billingType: 'TIME_MATERIAL' | 'FIXED_PRICE' | 'SUBSCRIPTION';
  categoryId: string;
  description: string;
  basePrice: number;
  unit: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'DRAFT';
  finalPrice?: number;
}

const CATEGORY_NAMES: Record<string, string> = {
  '1': 'Development',
  '2': 'Design / UX',
  '3': 'DevOps',
  '4': 'Consulting',
};

interface ServiceListTableProps {
  data: ServiceMock[];
}

export function ServiceListTable({ data }: ServiceListTableProps) {
  const renderPrice = (service: ServiceMock) => {
    const price = service.finalPrice || service.basePrice || 0;
    const formattedPrice = price.toLocaleString('pl-PL', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    switch (service.billingType) {
      case 'TIME_MATERIAL':
        return (
          <span className="text-slate-700 dark:text-slate-300 font-medium">
            ~{formattedPrice} PLN
            <span className="text-slate-500 text-xs ml-1">(est.)</span>
          </span>
        );
      case 'FIXED_PRICE':
      case 'SUBSCRIPTION':
        return (
          <span className="text-slate-700 dark:text-slate-300 font-medium">
            {formattedPrice} PLN
            <span className="text-slate-500 text-xs ml-1">/ {service.unit}</span>
          </span>
        );
      default:
        return '-';
    }
  };

  const renderTypeBadge = (type: string) => {
    switch (type) {
      case 'TIME_MATERIAL':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
            <Users className="w-3 h-3 mr-1" />
            T&M
          </span>
        );
      case 'FIXED_PRICE':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">
            <Box className="w-3 h-3 mr-1" />
            Fixed
          </span>
        );
      case 'SUBSCRIPTION':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
            <RefreshCw className="w-3 h-3 mr-1" />
            Subskrypcja
          </span>
        );
      default:
        return null;
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <Badge
            variant="outline"
            className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"
          >
            Aktywna
          </Badge>
        );
      case 'ARCHIVED':
        return (
          <Badge
            variant="outline"
            className="bg-slate-100 text-slate-700 dark:bg-slate-700/40 dark:text-slate-400 border-slate-200 dark:border-slate-600"
          >
            Archiwum
          </Badge>
        );
      case 'DRAFT':
        return (
          <Badge
            variant="outline"
            className="bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border-purple-200 dark:border-purple-500/20"
          >
            Szkic
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-white dark:bg-[#0B1121] border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
            <TableRow className="border-slate-200 dark:border-slate-800 hover:bg-transparent">
              <TableHead className="text-slate-500 font-semibold pl-6">Nazwa usługi</TableHead>
              <TableHead className="text-slate-500 font-semibold">Typ</TableHead>
              <TableHead className="text-slate-500 font-semibold">Kategoria</TableHead>
              <TableHead className="text-slate-500 font-semibold">Cennik</TableHead>
              <TableHead className="text-slate-500 font-semibold">Status</TableHead>
              <TableHead className="text-right pr-6"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((service) => (
              <TableRow
                key={service.id}
                className="border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
              >
                <TableCell className="font-medium pl-6">
                  <div className="text-slate-900 dark:text-white">{service.name}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[250px]">
                    {service.description}
                  </div>
                </TableCell>
                <TableCell>{renderTypeBadge(service.billingType)}</TableCell>
                <TableCell className="text-slate-600 dark:text-slate-400 text-sm">
                  {CATEGORY_NAMES[service.categoryId] || service.categoryId}
                </TableCell>
                <TableCell>{renderPrice(service)}</TableCell>
                <TableCell>{renderStatusBadge(service.status)}</TableCell>
                <TableCell className="text-right pr-6">
                  <ServiceSheet serviceToEdit={service}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </ServiceSheet>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
