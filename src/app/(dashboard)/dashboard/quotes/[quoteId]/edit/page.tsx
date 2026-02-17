// src/app/(dashboard)/dashboard/quotes/[quoteId]/edit/page.tsx

import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma-client';
import { QuoteEditor } from '@/components/dashboard/quotes/editor/quote-editor';
import { normalizePrismaData } from '@/lib/utils';
import { getQuoteVersions } from '@/lib/data/quote';

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

    const rawVersions = await getQuoteVersions(rawQuote.quote_code);

    const quote = normalizePrismaData(rawQuote);
    const versions = normalizePrismaData(rawVersions);

    const [clients, projects, positions, serviceTemplates] = await Promise.all([
        prisma.clients.findMany({}),
        prisma.projects.findMany({}),
        prisma.positions.findMany({}),
        prisma.serviceTemplate.findMany({}),
    ]);

    return (
        // [FIX] Kluczowa zmiana: Sztywna wysokość kontenera (viewport - header)
        // Dzięki temu wewnętrzne scrollbary w QuoteEditor będą działać.
        <div className="h-[calc(100vh-4rem)] overflow-hidden">
            <QuoteEditor
                clients={normalizePrismaData(clients)}
                projects={normalizePrismaData(projects)}
                positions={normalizePrismaData(positions)}
                serviceTemplates={normalizePrismaData(serviceTemplates)}
                initialData={quote}
                versions={versions}
            />
        </div>
    );
}