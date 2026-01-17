import 'server-only';
import { prisma } from '@/lib/prisma-client';
import { QuoteDataExtended } from '@/types/quote';

export async function getQuoteForPdf(quoteId: number): Promise<QuoteDataExtended | null> {
  try {
    const quote = await prisma.pricing_history.findUnique({
      where: { id: quoteId },
      include: {
        client: {
          include: { client_addresses: true },
        },
        project: {
          include: { project_details: true },
        },
        pricingServices: {
          include: {
            serviceResources: {
              include: { position: true },
            },
          },
        },
      },
    });

    return quote;
  } catch (error) {
    console.error('Błąd pobierania wyceny:', error); // debug log
    throw new Error('Nie udało się załadować wyceny. Spróbuj odświeżyć stronę.');
  }
}
