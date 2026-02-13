// src/app/(dashboard)/dashboard/quotes/[quoteId]/edit/page.tsx

import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma-client';
import { QuoteEditor } from '@/components/dashboard/quotes/editor/quote-editor';
import { normalizePrismaData } from '@/lib/utils';
import { getQuoteVersions } from '@/lib/data/quote'; // [NOWOŚĆ] Import funkcji

interface EditQuotePageProps {
    params: Promise<{ quoteId: string }>;
}

export default async function EditQuotePage({ params }: EditQuotePageProps) {
    const { quoteId } = await params;
    const id = parseInt(quoteId);

    if (isNaN(id)) return notFound();

    const rawQuote = await prisma.pricing_history.findUnique({
        where: { id },
        include: {
            pricingServices: {
                include: {
                    serviceResources: true,
                },
            },
            client: true,
        },
    });

    if (!rawQuote) return notFound();

    // [NOWOŚĆ] Pobieramy wersje dla tej oferty
    // Jeśli quote_code jest null (nowa oferta), zwróci pustą tablicę
    const rawVersions = await getQuoteVersions(rawQuote.quote_code);

    // Konwersja Decimal -> number
    const quote = normalizePrismaData(rawQuote);
    const versions = normalizePrismaData(rawVersions); // [NOWOŚĆ] Normalizacja wersji

    // Pobieranie słowników...
    const [clients, projects, positions, serviceTemplates] = await Promise.all([
        prisma.clients.findMany({}),
        prisma.projects.findMany({}),
        prisma.positions.findMany({}),
        prisma.serviceTemplate.findMany({}),
    ]);

    return (
        <div className="flex flex-col h-full">
            <QuoteEditor
                clients={normalizePrismaData(clients)}
                projects={normalizePrismaData(projects)}
                positions={normalizePrismaData(positions)}
                serviceTemplates={normalizePrismaData(serviceTemplates)}
                initialData={quote}
                versions={versions} // [NOWOŚĆ] Przekazujemy wersje do edytora
            />
        </div>
    );
}