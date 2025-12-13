import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Quote {
  id: string;
  client: string;
  project: string;
  amount: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
}

const recentQuotes: Quote[] = [
  {
    id: 'EST-2024-001',
    client: 'TechCorp Sp. z o.o.',
    project: 'System ERP - Moduł Magazyn',
    amount: '45 000 zł',
    status: 'sent',
  },
  {
    id: 'EST-2024-002',
    client: 'Kancelaria Prawna Lex',
    project: 'Strona WWW + CMS',
    amount: '12 500 zł',
    status: 'draft',
  },
  {
    id: 'EST-2024-003',
    client: 'Logistics Pro',
    project: 'Aplikacja mobilna Kierowcy',
    amount: '85 000 zł',
    status: 'accepted',
  },
  {
    id: 'EST-2024-004',
    client: 'Green Energy SA',
    project: 'Audyt bezpieczeństwa',
    amount: '8 000 zł',
    status: 'rejected',
  },
];

function StatusBadge({ status }: { status: string }) {
  // FIX: Dodano typ Record<string, string>, dzięki czemu TypeScript wie,
  // że możemy używać dowolnego stringa jako klucza (index signature).
  const styles: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-700',
    sent: 'bg-blue-50 text-blue-700',
    accepted: 'bg-emerald-50 text-emerald-700',
    rejected: 'bg-red-50 text-red-700',
  };

  const labels: Record<string, string> = {
    draft: 'Szkic',
    sent: 'Wysłana',
    accepted: 'Zaakceptowana',
    rejected: 'Odrzucona',
  };

  return (
    // FIX: Usunięto 'as any'. Dodano fallback (|| styles.draft),
    // na wypadek gdyby przyszedł status spoza listy.
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ring-black/5',
        styles[status] || styles.draft,
      )}
    >
      {labels[status] || status}
    </span>
  );
}

export function RecentQuotes() {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-bold">Ostatnie Wyceny</CardTitle>
        <Button variant="ghost" size="sm" className="text-primary font-medium">
          Wszystkie
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-3 font-medium">Nr Oferty</th>
                <th className="px-6 py-3 font-medium">Klient & Projekt</th>
                <th className="px-6 py-3 font-medium">Kwota</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentQuotes.map((quote) => (
                <tr key={quote.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{quote.id}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">{quote.project}</div>
                    <div className="text-xs text-muted-foreground">{quote.client}</div>
                  </td>
                  <td className="px-6 py-4 font-medium">{quote.amount}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={quote.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                    >
                      <Download size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
