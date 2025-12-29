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
// POPRAWKA: Importujemy PositionSheet
import { PositionSheet } from '@/components/dashboard/positions/position-sheet';

interface Props {
  data: positions[];
}

export function PositionListTable({ data }: Props) {
  return (
    <div className="rounded-xl border bg-white dark:bg-[#0B1121] border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
          <TableRow className="border-slate-200 dark:border-slate-800 hover:bg-transparent">
            <TableHead className="text-slate-500 font-semibold pl-6">Nazwa stanowiska</TableHead>
            <TableHead className="text-slate-500 font-semibold">Stawka godzinowa (TODO)</TableHead>
            <TableHead className="text-right text-slate-500 font-semibold pr-6">Akcje</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="h-32 text-center text-muted-foreground">
                Brak stanowisk w bazie danych.
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
                      {/* HARDCODED 10 PLN zgodnie z życzeniem */}
                      10 [zł/h]
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right pr-6">
                  {/* POPRAWKA: Button opakowany w PositionSheet */}
                  <PositionSheet position={position}>
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
