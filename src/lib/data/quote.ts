import 'server-only';
import { prisma } from '@/lib/prisma-client';
import { QuoteDataForPdf } from '@/types/quote';

export async function getQuoteVersions(quoteCode: string | null) {
  if (!quoteCode) return [];

  try {
    // 1. Znajdź "bazowy" kod oferty (np. "OFERTA/2025/001" z "OFERTA/2025/001-v2")
    // Usuwamy końcówkę -vCYFRY, jeśli istnieje
    const baseCode = quoteCode.replace(/-v\d+$/, '');

    // 2. Szukamy wszystkich ofert, które zaczynają się od tego kodu bazowego
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
        quote_date: true, // Używamy quote_date (bo created_at nie masz w bazie)
        is_current_version: true,
        quote_code: true, // Pobieramy kod, aby go zweryfikować poniżej
      },
      orderBy: {
        version: 'desc',
      },
    });

    // 3. Dodatkowe filtrowanie, aby uniknąć pomyłek (np. żeby oferta ...001 nie złapała ...0010)
    // Akceptujemy tylko: dokładny kod bazowy LUB kod bazowy + "-v..."
    const filteredVersions = versions.filter(v =>
      v.quote_code === baseCode ||
      v.quote_code?.startsWith(`${baseCode}-v`)
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


