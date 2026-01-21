'use server';

import { renderToBuffer } from '@react-pdf/renderer';
import { QuoteTemplate } from '@/components/shared/quote-template';
import { getQuoteForEmail, getQuoteForPdf } from '@/lib/data/quote';
import path from 'node:path';
import { mkdir, writeFile, readFile, access } from 'fs/promises';
import { constants } from 'fs';
import { mailOptions, transporter } from '@/lib/nodemailer';
import { prisma } from '@/lib/prisma-client';
import { revalidatePath } from 'next/cache';

const getStoragePath = (filename: string) =>
  path.join(process.cwd(), 'storage', 'quotes', filename);

export async function generateQuotePdfAction(quoteId: number) {
  // TODO: AUTH HERE
  try {
    const quoteData = await getQuoteForPdf(quoteId);

    if (!quoteData) {
      return { ok: false, error: 'Nie znaleziono oferty o podanym ID.' };
    }

    const pdf = await renderToBuffer(QuoteTemplate({ data: quoteData }));

    // Sanitizer: It will replace every /,\,\\ to -
    const safeFileName = quoteData.quote_code
      ? `${quoteData.quote_code.replace(/[\/\\]/g, '-')}.pdf`
      : `${quoteId}.pdf`;
    const filePath = getStoragePath(safeFileName);
    const dirPath = path.dirname(filePath);

    await mkdir(dirPath, { recursive: true });

    await writeFile(filePath, pdf);

    return {
      ok: true,
      message: `Pomyślnie wygenerowano pdf.`,
      previewUrl: `/api/quotes/download/${safeFileName}`,
    };
  } catch (error) {
    console.error('Quote generating error:', error);
    return { ok: false, error: 'Wystąpił błąd podczas generowania wyceny.' };
  }
}

export async function sendExistingQuotePdfAction(quoteId: number) {
  // TODO: AUTH HERE

  try {
    const quoteData = await getQuoteForEmail(quoteId);

    if (!quoteData) {
      return { ok: false, error: 'Nie znaleziono oferty o podanym ID.' };
    }
    if (!quoteData.client.email) {
      return { ok: false, error: 'Brak adresu email klienta.' };
    }

    const safeFileName = quoteData.quote_code
      ? `${quoteData.quote_code.replace(/[\/\\]/g, '-')}.pdf`
      : `${quoteId}.pdf`;
    const filePath = getStoragePath(safeFileName);

    try {
      await access(filePath, constants.F_OK);
    } catch {
      return {
        ok: false,
        error: "Plik PDF nie został jeszcze wygenerowany. Kliknij najpierw 'Generuj'.",
      };
    }

    const pdf = await readFile(filePath);

    await transporter.sendMail({
      ...mailOptions,
      to: quoteData.client.email,
      subject: `Oferta: ${quoteData.quote_code}`,
      html: `<p>Dzień dobry,<br>W załączniku przesyłamy uzgodnioną ofertę.</p>`,
      attachments: [
        {
          filename: safeFileName,
          content: pdf,
          contentType: 'application/pdf',
        },
      ],
    });

    await prisma.pricing_history.update({
      where: { id: quoteId },
      data: { status: 'SENT' },
    });

    revalidatePath(`/dashboard/quotes`);
    return { ok: true, message: 'Pomyślnie wysłano wycenę.' };
  } catch (error) {
    console.error('Quote sending error:', error);
    return { ok: false, error: 'Wystąpił błąd podczas wysyłania wyceny.' };
  }
}
