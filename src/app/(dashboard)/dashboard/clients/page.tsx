import { ClientListTable } from '@/components/shared/ClientListTable';
import { clients } from '@/generated/prisma/client';

// Mock Data for testing only
const mockClients: clients[] = [
  {
    id: 1,
    first_name: 'Jan',
    last_name: 'Kowalski',
    email: 'jan.kowalski@techcorp.pl',
    phone: '+48 123 456 789',
    is_lead: true,
  },
  {
    id: 2,
    first_name: 'Anna',
    last_name: 'Nowak',
    email: 'a.nowak@creativeagency.com',
    phone: '+48 987 654 321',
    is_lead: false,
  },
  {
    id: 3,
    first_name: 'Marek',
    last_name: 'Zieliński',
    email: 'm.zielinski@softwarehouse.io',
    phone: null,
    is_lead: true,
  },
];

export default async function ClientsPage() {
  // after tests: const data = await getClientsList();
  const data = mockClients;

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Klienci i Leady
          </h2>
          <p className="text-muted-foreground">Zarządzaj bazą kontaktów.</p>
        </div>
      </div>

      <ClientListTable data={data} />
    </div>
  );
}
