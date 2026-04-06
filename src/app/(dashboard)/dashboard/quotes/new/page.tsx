import { prisma } from '@/lib/prisma-client';
import { QuoteEditor } from '@/components/dashboard/quotes/editor/quote-editor';

export default async function NewQuotePage() {
  // 1. Pobieramy dane z bazy (to są obiekty Prisma z Decimalami)
  const [rawClients, rawProjects, rawPositions, rawServiceTemplates] = await Promise.all([
    prisma.clients.findMany({
      orderBy: { last_name: 'asc' },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        client_addresses: true,
      },
    }),
    prisma.projects.findMany({
      include: {
        project_details: {
          take: 1,
          orderBy: { id: 'desc' },
        },
      },
    }),
    prisma.positions.findMany({
      orderBy: { name: 'asc' },
    }),
    prisma.serviceTemplate.findMany({
      where: { isActive: true },
      include: { resources: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  // 2. Konwersja (Serializacja) - zamieniamy Decimal na number dla komponentów klienckich

  // Klienci zazwyczaj nie mają Decimali w tym select, ale dla bezpieczeństwa przekazujemy jak jest
  const clients = rawClients;

  // Projekty: project_details mogą mieć Decimale
  const projects = rawProjects.map((project) => ({
    ...project,
    project_details: project.project_details.map((detail) => ({
      ...detail,
      estimated_hours: detail.estimated_hours ? Number(detail.estimated_hours) : null,
      estimated_price: detail.estimated_price ? Number(detail.estimated_price) : null,
    })),
  }));

  // Stanowiska: cost i rate to Decimale
  const positions = rawPositions.map((pos) => ({
    ...pos,
    cost: Number(pos.cost),
    rate: Number(pos.rate),
  }));

  // Szablony: resources mają estimated_quantity i price_override jako Decimale
  const serviceTemplates = rawServiceTemplates.map((template) => ({
    ...template,
    resources: template.resources.map((res) => ({
      ...res,
      estimated_quantity: Number(res.estimated_quantity),
      price_override: res.price_override ? Number(res.price_override) : null,
      // unit_price/cost nie są w bazie szablonu (są dynamiczne), więc tu ich nie ruszamy
    })),
  }));

  // 3. Przekazujemy "czyste" dane JSON do edytora
  return (
    <div className="h-[calc(100vh-4rem)] overflow-hidden">
      <QuoteEditor
        clients={clients}
        projects={projects}
        positions={positions}
        serviceTemplates={serviceTemplates}
      />
    </div>
  );
}
