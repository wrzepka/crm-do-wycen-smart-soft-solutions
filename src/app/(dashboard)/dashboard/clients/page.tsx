import { ClientListTable } from '@/components/shared/ClientListTable';
import { ClientWithRelations } from '@/types/client';
import { DataTablePagination } from '@/components/shared/DataPagination';

// Mock Data for testing only
const mockClients: ClientWithRelations[] = [
  {
    id: 1,
    first_name: 'Jan',
    last_name: 'Kowalski',
    email: 'jan.kowalski@techcorp.pl',
    phone: '+48 123 456 789',
    is_lead: false,
    client_addresses: {
      id: 101,
      client_id: 1,
      city: 'Warszawa',
      postal_code: '00-001',
      street: 'Marszałkowska',
      building_number: '10/2',
      nip: '5260000494',
    },
  },
  {
    id: 2,
    first_name: 'Anna',
    last_name: 'Nowak',
    email: 'a.nowak@creativeagency.com',
    phone: '+48 987 654 321',
    is_lead: false,
    client_addresses: {
      id: 102,
      client_id: 2,
      city: 'Kraków',
      postal_code: '31-001',
      street: 'Floriańska',
      building_number: '5',
      nip: '6760000321',
    },
  },
  {
    id: 3,
    first_name: 'Marek',
    last_name: 'Zieliński',
    email: 'm.zielinski@softwarehouse.io',
    phone: null,
    is_lead: true,
    client_addresses: {
      id: 103,
      client_id: 3,
      city: 'Wrocław',
      postal_code: '50-001',
      street: 'Ratuszowa',
      building_number: '1',
      nip: '8970000111',
    },
  },
  {
    id: 4,
    first_name: 'Karolina',
    last_name: 'Wiśniewska',
    email: 'k.wisniewska@retailplus.pl',
    phone: '500 600 700',
    is_lead: true,
    client_addresses: null, // Testujemy brak adresu
  },
  {
    id: 5,
    first_name: 'Piotr',
    last_name: 'Lewandowski',
    email: 'p.lewandowski@freelance.pl',
    phone: '660 770 880',
    is_lead: false,
    client_addresses: {
      id: 105,
      client_id: 5,
      city: 'Poznań',
      postal_code: '61-001',
      street: 'Święty Marcin',
      building_number: '44',
      nip: '7780000999',
    },
  },
];

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  // Get page parameter
  const { page } = await searchParams;
  // Get current page, otherwise set it to 1
  const currentPage = Math.max(1, Number(page) || 1);
  // Amount of rows per page
  const pageSize = 2;
  // after tests: const data = await getClientsList(currentPage, pageSize);
  const data = mockClients;
  const totalPages = Math.ceil(data.length / pageSize);

  // Calculate starting index and get part of the data to show them inside the table
  const startIndex = (currentPage - 1) * pageSize;
  // To change in future. To delete I think. Slicing is inside of the getClientsList()
  const slicedData = data.slice(startIndex, startIndex + pageSize);

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

      <ClientListTable data={slicedData} />

      {/*Pagination component*/}
      <div className="mt-4 flex justify-center">
        <DataTablePagination currentPage={currentPage} totalPages={totalPages} />
      </div>
    </div>
  );
}
