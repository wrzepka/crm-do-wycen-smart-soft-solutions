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
import { clients } from '@/generated/prisma/client';

interface Props {
  data: clients[];
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
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
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
