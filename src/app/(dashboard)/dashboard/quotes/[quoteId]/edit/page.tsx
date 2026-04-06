import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma-client';
import {
  QuoteEditor,
  ClientOption,
  DictionaryItem,
  InitialData,
} from '@/components/dashboard/quotes/editor/quote-editor';
import { QuoteVersion } from '@/components/dashboard/quotes/editor/quote-version-selector';
import { normalizePrismaData } from '@/lib/utils';
import { getQuoteVersions } from '@/lib/data/quote';

interface EditQuotePageProps {
  params: Promise<{ quoteId: string }>;
}

export default async function EditQuotePage({ params }: EditQuotePageProps) {
  const { quoteId } = await params;
  const id = parseInt(quoteId);

  if (isNaN(id)) return notFound();

  // 1. fetching quote data with related client and services
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

  // 2. fetching versionf of the quote
  const rawVersions = await getQuoteVersions(rawQuote.quote_code);

  const [clients, positions, serviceTemplates] = await Promise.all([
    prisma.clients.findMany({
      orderBy: { last_name: 'asc' },
    }),
    prisma.positions.findMany({}),
    prisma.serviceTemplate.findMany({
      include: {
        resources: true,
      },
    }),
  ]);

  // 4. data normalization
  const quote = normalizePrismaData(rawQuote) as unknown as InitialData;
  const versions = normalizePrismaData(rawVersions) as unknown as QuoteVersion[];
  const normalizedClients = normalizePrismaData(clients) as unknown as ClientOption[];
  const normalizedPositions = normalizePrismaData(positions) as unknown as DictionaryItem[];
  const normalizedTemplates = normalizePrismaData(serviceTemplates) as unknown as DictionaryItem[];

  return (
    <div className="h-[calc(100vh-4rem)] overflow-hidden">
      <QuoteEditor
        clients={normalizedClients}
        positions={normalizedPositions}
        serviceTemplates={normalizedTemplates}
        initialData={quote}
        versions={versions}
      />
    </div>
  );
}
