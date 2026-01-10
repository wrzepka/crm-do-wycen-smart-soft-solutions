'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { positions } from '@/generated/prisma/client';
import { Button } from '@/components/ui/button';
import { Edit2 } from 'lucide-react';
import { PositionSheet } from '@/components/dashboard/positions/position-sheet';
import { useIsFiltered } from '@/lib/hooks';

// custom type to handle prisma decimal serialization issue since client components expect plain numbers
type SerializedPosition = Omit<positions, 'hourly_rate'> & {
  hourly_rate: number | null;
};

interface Props {
  data: SerializedPosition[];
}

export function PositionListTable({ data }: Props) {
  const isFiltered = useIsFiltered(['query']);

  return (
    <div className="rounded-xl border bg-white dark:bg-[#0B1121] border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
          <TableRow className="border-slate-200 dark:border-slate-800 hover:bg-transparent">
            <TableHead className="text-slate-500 font-semibold pl-6">Nazwa stanowiska</TableHead>
            <TableHead className="text-slate-500 font-semibold">Stawka godzinowa</TableHead>
            <TableHead className="text-right text-slate-500 font-semibold pr-6">Akcje</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="h-32 text-center text-muted-foreground">
                {isFiltered ? 'Brak stanowisk spełniających kryteria' : 'Brak dodanych stanowisk'}
              </TableCell>
            </TableRow>
          ) : (
            data.map((position) => (
              <TableRow
                key={position.id}
                className="border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors"
              >
                <TableCell className="pl-6">
                  <span className="font-medium text-slate-900 dark:text-white text-base">
                    {position.name}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-slate-400 font-mono">
                      {/* formatting number to 2 decimal places with currency */}
                      {position.hourly_rate !== null
                        ? `${position.hourly_rate.toFixed(2)} PLN/h`
                        : '-'}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right pr-6">
                  {/* type casting is necessary here because position sheet expects prisma decimal type, but we are passing a serialized number */}
                  <PositionSheet position={position as unknown as positions}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer"
                    >
                      <Edit2 size={15} />
                    </Button>
                  </PositionSheet>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
