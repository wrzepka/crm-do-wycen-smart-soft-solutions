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
          {/* Conditional rendering: Show message if no results found, otherwise list positions */}
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
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
                    <span className="text-[11px] text-slate-400 font-mono">
                      {/*  TO CHANGE IN THE FUTURE. NOW IT IS HARD-CODED*/}
                      10
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right pr-6">
                  <span>BUTTON IDK</span>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
