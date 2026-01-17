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
import { Edit2 } from 'lucide-react';
import { ServiceSheet } from './service-sheet';
// import position type to use in props
import { PositionOption } from './service-form';

// define resource shape to avoid using any
interface ServiceResourceDTO {
  id: string;
  label: string;
  positionId: string | null;
  estimatedHours: number;
  defaultUnitPrice: number;
}

// dto matching backend data
export interface ServiceTemplateDTO {
  id: string;
  name: string;
  description: string | null;
  defaultMargin: number;
  isActive: boolean;
  // optional/calculated fields for display
  estimatedPrice?: number;
  resources?: ServiceResourceDTO[];
}

interface ServiceListTableProps {
  data: ServiceTemplateDTO[];
  // logic: pass positions prop here to forward it to service sheet for editing mode
  positions?: PositionOption[];
}

export function ServiceListTable({ data, positions = [] }: ServiceListTableProps) {

  const renderPrice = (service: ServiceTemplateDTO) => {
    const price = service.estimatedPrice || 0;
    return (
      <span className="font-mono font-medium text-slate-900 dark:text-slate-200">
        {price.toLocaleString('pl-PL', {
          style: 'currency',
          currency: 'PLN',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })}
      </span>
    );
  };

  const renderStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/25 border-0">
          Aktywna
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-slate-500 border-slate-300 dark:border-slate-700">
        Nieaktywna
      </Badge>
    );
  };

  return (
    <div className="rounded-md border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-[#0B1121]">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
            <TableRow className="border-slate-200 dark:border-slate-800">
              <TableHead className="text-slate-500 dark:text-slate-400 pl-6 w-[40%]">Nazwa Usługi</TableHead>
              <TableHead className="text-slate-500 dark:text-slate-400 w-[15%]">Marża</TableHead>
              <TableHead className="text-slate-500 dark:text-slate-400 w-[20%]">Cena est.</TableHead>
              <TableHead className="text-slate-500 dark:text-slate-400 w-[15%]">Status</TableHead>
              <TableHead className="text-right text-slate-500 dark:text-slate-400 pr-6 w-[10%]">Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                  Brak usług spełniających kryteria.
                </TableCell>
              </TableRow>
            ) : (
              data.map((service) => (
                <TableRow
                  key={service.id}
                  className="border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                >
                  <TableCell className="font-medium pl-6">
                    <div className="text-slate-900 dark:text-white">{service.name}</div>
                    {service.description && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[350px] mt-0.5">
                        {service.description}
                      </div>
                    )}
                  </TableCell>

                  <TableCell>
                    <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {service.defaultMargin}%
                    </Badge>
                  </TableCell>

                  <TableCell>{renderPrice(service)}</TableCell>
                  <TableCell>{renderStatusBadge(service.isActive)}</TableCell>

                  <TableCell className="text-right pr-6">
                    {/* logic: pass positions to sheet for edit form */}
                    <ServiceSheet serviceToEdit={service} positions={positions}>
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
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}