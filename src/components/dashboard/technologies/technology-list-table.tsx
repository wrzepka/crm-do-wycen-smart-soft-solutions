'use client'; // Client Component

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit2 } from 'lucide-react';
import { TechnologySheet } from '@/components/dashboard/technologies/technology-sheet';
import { getColorForTechnology } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useIsFiltered } from '@/lib/hooks';

// Simplified interface matching Prisma output
interface TechnologyData {
  id: number;
  name: string;
  _count: {
    employee_technology: number;
  };
}

interface Props {
  data: TechnologyData[];
}

export function TechnologyListTable({ data }: Props) {
  const isFiltered = useIsFiltered(['query']);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-white dark:bg-[#0B1121] border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
            <TableRow className="border-slate-200 dark:border-slate-800 hover:bg-transparent">
              <TableHead className="text-slate-500 font-semibold pl-6">Nazwa Technologii</TableHead>
              <TableHead className="text-slate-500 font-semibold">Ilość pracowników</TableHead>
              <TableHead className="text-right text-slate-500 font-semibold pr-6">Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-32 text-center text-muted-foreground">
                  {isFiltered
                    ? 'Brak technologii spełniających kryteria'
                    : 'Brak dodanych technologii'}
                </TableCell>
              </TableRow>
            ) : (
              // Rendering all data directly
              data.map((tech) => (
                <TableRow
                  key={tech.id}
                  className="border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors"
                >
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="outline"
                        className={`text-sm font-medium border ${getColorForTechnology(tech.name)}`}
                      >
                        {tech.name}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-slate-500 font-normal">
                      {tech._count.employee_technology}
                    </span>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <TechnologySheet technology={tech}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer"
                      >
                        <Edit2 size={15} />
                      </Button>
                    </TechnologySheet>
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
