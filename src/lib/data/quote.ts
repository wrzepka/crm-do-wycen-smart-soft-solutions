import 'server-only';
import { prisma } from '@/lib/prisma-client';
import { QuoteDataForPdf } from '@/types/quote';

export async function getQuoteForPdf(quoteId: number): Promise<QuoteDataForPdf | null> {
  try {
    const quote = await prisma.pricing_history.findUnique({
      where: { id: quoteId },
      include: {
        client: {
          include: { client_addresses: true },
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

export async function getQuoteForLink(quoteId: number) {
  try {
    const quote = await prisma.pricing_history.findUnique({
      where: { id: quoteId },
      select: {
        quote_code: true,
      },
    });

    return quote;
  } catch (error) {
    console.error('Błąd pobierania wyceny:', error); // debug log
    throw new Error('Nie udało się załadować wyceny. Spróbuj odświeżyć stronę.');
  }
}

export async function getQuoteForEmail(quoteId: number) {
  try {
    const quote = await prisma.pricing_history.findUnique({
      where: { id: quoteId },
      select: {
        id: true,
        quote_code: true,
        client: {
          select: {
            email: true,
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
