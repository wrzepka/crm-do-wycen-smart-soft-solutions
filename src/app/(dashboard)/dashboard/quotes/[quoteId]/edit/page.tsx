// src/app/(dashboard)/dashboard/quotes/[quoteId]/edit/page.tsx
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma-client';
import { QuoteEditor } from '@/components/dashboard/quotes/editor/quote-editor';
import { normalizePrismaData } from '@/lib/utils'; // <--- IMPORT

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

    // Konwersja Decimal -> number
    const quote = normalizePrismaData(rawQuote);

    // Pobieranie słowników...
    const [clients, projects, positions, serviceTemplates] = await Promise.all([
        // ... Twoje zapytania
        prisma.clients.findMany({ /*...*/ }),
        prisma.projects.findMany({ /*...*/ }),
        prisma.positions.findMany({ /*...*/ }),
        prisma.serviceTemplate.findMany({ /*...*/ }),
    ]);

    return (
        <div className="flex flex-col h-full">
            <QuoteEditor
                clients={normalizePrismaData(clients)} // Też warto przepuścić, jeśli mają Decimale
                projects={normalizePrismaData(projects)}
                positions={normalizePrismaData(positions)}
                serviceTemplates={normalizePrismaData(serviceTemplates)}
                initialData={quote} // <--- Teraz to jest bezpieczny obiekt
            />
        </div>
    );
}