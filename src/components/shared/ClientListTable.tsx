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
import { ClientWithRelations } from '@/types/client';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';
import { ClientSheet } from '@/components/dashboard/clients/client-sheet';

interface Props {
  data: ClientWithRelations[];
}

export function ClientListTable({ data }: Props) {
  return (
    <div className="rounded-xl border bg-white dark:bg-[#0B1121] border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
          <TableRow className="border-slate-200 dark:border-slate-800 hover:bg-transparent">
            <TableHead className="text-slate-500 font-semibold pl-6">Typ</TableHead>
            <TableHead className="text-slate-500 font-semibold">Imię i Nazwisko</TableHead>
            <TableHead className="text-slate-500 font-semibold">Email</TableHead>
            <TableHead className="text-slate-500 font-semibold">Telefon</TableHead>
            <TableHead className="text-right text-slate-500 font-semibold pr-6">Akcje</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                Brak klientów/leadów w bazie danych
              </TableCell>
            </TableRow>
          ) : (
            data.map((client) => (
              <TableRow
                key={client.id}
                className="border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors"
              >
                <TableCell className="pl-6">
                  {client.is_lead ? (
                    <Badge className="border-amber-200 bg-amber-50 text-amber-700">Lead</Badge>
                  ) : (
                    <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                      Klient
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <span className="font-medium text-slate-900 dark:text-white text-base">
                    {client.first_name} {client.last_name}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="font-medium text-slate-900 dark:text-white text-base">
                    {client.email}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="font-medium text-slate-900 dark:text-white text-base">
                    {client.phone || 'Brak numeru'}
                  </span>
                </TableCell>
                <TableCell className="text-right pr-6">
                  {/* Triggering the edit sheet with the selected employee data */}
                  <ClientSheet client={client}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer"
                    >
                      <Info size={15} />
                    </Button>
                  </ClientSheet>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
