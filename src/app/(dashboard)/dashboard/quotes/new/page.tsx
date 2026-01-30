import { prisma } from '@/lib/prisma-client';
import { QuoteEditor } from '@/components/dashboard/quotes/editor/quote-editor';

export default async function NewQuotePage() {
    const [clients, rawProjects, rawPositions, rawServiceTemplates] = await Promise.all([
        prisma.clients.findMany({
            orderBy: { last_name: 'asc' },
            select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                client_addresses: true
            },
        }),
        prisma.projects.findMany({
            include: {
                project_details: {
                    take: 1,
                    orderBy: { id: 'desc' }
                }
            }
        }),
        // Pobieramy stanowiska (zawierają Decimal: cost, rate)
        prisma.positions.findMany({
            orderBy: { name: 'asc' }
        }),
        // Pobieramy szablony (zasoby zawierają Decimal: price_override, estimated_quantity)
        prisma.serviceTemplate.findMany({
            where: { isActive: true },
            include: { resources: true },
            orderBy: { name: 'asc' }
        })
    ]);

    // --- SERIALIZACJA DANYCH (Decimal -> number) ---

    // 1. Konwersja Stanowisk
    const positions = rawPositions.map(pos => ({
        ...pos,
        cost: Number(pos.cost),
        rate: Number(pos.rate)
    }));

    // 2. Konwersja Szablonów Usług
    const serviceTemplates = rawServiceTemplates.map(template => ({
        ...template,
        resources: template.resources.map(res => ({
            ...res,
            // Decimal może być nullem w bazie, więc bezpiecznie rzutujemy
            estimated_quantity: Number(res.estimated_quantity || 0),
            price_override: res.price_override ? Number(res.price_override) : null
        }))
    }));

    // 3. Konwersja Projektów (dla pewności, bo project_details też mogą mieć Decimal)
    const projects = rawProjects.map(project => ({
        ...project,
        project_details: project.project_details.map(detail => ({
            ...detail,
            estimated_hours: detail.estimated_hours ? Number(detail.estimated_hours) : null,
            estimated_price: detail.estimated_price ? Number(detail.estimated_price) : null,
        }))
    }));

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