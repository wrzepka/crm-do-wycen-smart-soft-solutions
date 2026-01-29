import { prisma } from '@/lib/prisma-client';
import { QuoteActionsBar } from '@/components/shared/quote-action-bar';
import path from 'path';
import { access, constants } from 'fs/promises';

// ######## TESTING PAGE ########

async function checkPdfExists(code: string | null, id: number) {
  const safeName = code ? `${code.replace(/[\/\\]/g, '-')}.pdf` : `${id}.pdf`;

  const filePath = path.join(process.cwd(), 'storage', 'quotes', safeName);

  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export default async function TestPage() {
  const quotes = await prisma.pricing_history.findMany({
    orderBy: { id: 'desc' },
    include: { client: true },
  });

  const data = await Promise.all(
    quotes.map(async (q) => {
      const hasPdf = await checkPdfExists(q.quote_code, q.id);
      return { ...q, hasPdf };
    }),
  );

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-6">Testowanie Generowania i Wysyłki</h1>

      <table className="w-full border-collapse border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-3 text-left">ID / KOD</th>
            <th className="border p-3 text-left">Klient</th>
            <th className="border p-3 text-left">Status</th>
            <th className="border p-3 text-left">Kwota</th>
            <th className="border p-3 text-center">AKCJE (Testuj to)</th>
          </tr>
        </thead>
        <tbody>
          {data.map((quote) => (
            <tr key={quote.id} className="hover:bg-gray-50">
              <td className="border p-3 font-mono">{quote.quote_code || quote.id}</td>
              <td className="border p-3">
                {quote.client.first_name} {quote.client.last_name} <br />
                <span className="text-xs text-gray-500">{quote.client.email}</span>
              </td>
              <td className="border p-3">
                <span
                  className={`px-2 py-1 rounded text-xs font-bold ${
                    quote.status === 'SENT' ? 'bg-green-200 text-green-800' : 'bg-gray-200'
                  }`}
                >
                  {quote.status}
                </span>
              </td>
              <td className="border p-3">{Number(quote.total_net).toFixed(2)} PLN</td>
              <td className="border p-3 text-center">
                <div className="flex justify-center">
                  <QuoteActionsBar
                    quoteId={quote.id}
                    clientEmail={quote.client.email}
                    isPdfGenerated={quote.hasPdf}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
