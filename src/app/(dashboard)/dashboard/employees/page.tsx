import { EmployeeListTable } from '@/components/shared/EmployeeListTable';
import { EmployeeWithRelations } from '@/types/employee';

export default async function EmployeesPage() {
  // 1. MOCK DATA - testing data
  // TODO: Hubert do rest pls xpp
  const mockEmployees = [
    {
      id: 1,
      first_name: 'Jan',
      last_name: 'Kowalski',
      status: 'ACTIVE',
      // 1:N relation simulation
      employee_technology: [
        { technologies: { id: 1, name: 'React' } },
        { technologies: { id: 2, name: 'Node.js' } },
        { technologies: { id: 3, name: 'TypeScript' } },
      ],
    },
    {
      id: 2,
      first_name: 'Anna',
      last_name: 'Nowak',
      status: 'ACTIVE_BOOKED',
      busy_from: new Date('2023-11-01'),
      busy_to: new Date('2024-02-01'),
      employee_technology: [{ technologies: { id: 4, name: 'Figma' } }],
    },
    {
      id: 3,
      first_name: 'Piotr',
      last_name: 'Zieliński',
      status: 'ON_LEAVE',
      busy_from: new Date('2023-12-20'),
      busy_to: new Date('2024-01-05'),
      employee_technology: [],
    },
  ] as unknown as EmployeeWithRelations[];

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Zespół</h1>
      {/* Give mock data instead of real one*/}
      <EmployeeListTable data={mockEmployees} />
    </div>
  );
}
