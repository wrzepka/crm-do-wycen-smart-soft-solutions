import 'server-only';
import { prisma } from '@/lib/prisma-client';
import { QuoteDataForPdf } from '@/types/quote';

export async function getQuoteVersions(quoteCode: string | null) {
  if (!quoteCode) return [];

  try {
    // 1. Find quote id (e.g "OFERTA/2025/001" z "OFERTA/2025/001-v2")
    // deletind '-v' if exists
    const baseCode = quoteCode.replace(/-v\d+$/, '');

    // 2. Searching for every version with the same base code (OFERTA/2025/001, OFERTA/2025/001-v2, OFERTA/2025/001-v3 etc.)
    const versions = await prisma.pricing_history.findMany({
      where: {
        quote_code: {
          startsWith: baseCode,
        },
      },
      select: {
        id: true,
        version: true,
        status: true,
        quote_date: true,
        is_current_version: true,
        quote_code: true, //code to verify correct matching
      },
      orderBy: {
        version: 'desc',
      },
    });

    // 3. addicionally filter results to ensure we only get versions of the same quote
    const filteredVersions = versions.filter(
      (v) => v.quote_code === baseCode || v.quote_code?.startsWith(`${baseCode}-v`),
    );

    return filteredVersions;
  } catch (error) {
    console.error('Błąd pobierania wersji:', error);
    return [];
  }
}

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
