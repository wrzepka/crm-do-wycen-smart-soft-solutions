'use server';

import { renderToBuffer } from '@react-pdf/renderer';
import { QuoteTemplate } from '@/components/shared/quote-template';
import { getQuoteForPdf } from '@/lib/data/quote';

export async function downloadQuotePdfAction(quoteId: number) {
  try {
    const quoteData = await getQuoteForPdf(quoteId);

    if (!quoteData) {
      return { success: false, error: 'Nie znaleziono oferty o podanym ID.' };
    }

    const pdf = await renderToBuffer(QuoteTemplate({ data: quoteData }));

    // Sanitizer: It will replace every /,\,\\ to -
    const safeFileName = quoteData.quote_code
      ? `${quoteData.quote_code.replace(/[\/\\]/g, '-')}.pdf`
      : `${quoteId}.pdf`;

    return {
      success: true,
      data: pdf.toString('base64'),
      filename: safeFileName,
    };
  } catch (error) {
    console.error('Quote generating error:', error);
    return { ok: false, error: 'Wystąpił błąd podczas generowania wyceny.' };
  }
}
