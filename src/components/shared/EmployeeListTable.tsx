import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { EmployeeWithRelations } from '@/types/employee';

interface Props {
  data: EmployeeWithRelations[];
}

export function EmployeeListTable({ data }: Props) {
  return (
    //TODO: add the number of assigned projects
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Pracownik</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Technologie</TableHead>
            <TableHead>Liczba projektów</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                Brak pracowników.
              </TableCell>
            </TableRow>
          ) : (
            data.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>
                  <div className="font-medium">
                    {employee.first_name} {employee.last_name}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{employee.status}</div>
                  {
                    // if status is ACTIVE_BOOKED or ON_LEAVE display busy time period
                    employee.status == 'ACTIVE_BOOKED' ||
                      (employee.status == 'ON_LEAVE' && (
                        <div className="font-medium">
                          {employee.busy_from?.toLocaleDateString('pl-PL')} -{' '}
                          {employee.busy_to?.toLocaleDateString('pl-PL')}
                        </div>
                      ))
                  }
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {
                      // create badge for every tech
                      employee.employee_technology.map((rel) => (
                        <Badge
                          key={rel.technologies.id}
                          variant="secondary"
                          className="font-normal"
                        >
                          {rel.technologies.name}
                        </Badge>
                      ))
                    }
                  </div>
                </TableCell>
                <TableCell>
                  <div>in future</div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
