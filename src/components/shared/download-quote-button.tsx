'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, FileDown } from 'lucide-react';
import { generateQuotePdfAction } from '@/lib/actions/pdf-actions';

// TODO: move to specified folder (/quotes)?
// TODO: use zod validation for id in future (it is not developed yet)
// TODO: TEST IT
export function DownloadQuoteButton({ quoteId }: { quoteId: string }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    setIsLoading(true);

    try {
      const result = await generateQuotePdfAction(Number(quoteId));

      if (result.success && result.data) {
        // Base65 -> Blob -> Link conversion
        const byteCharacters = atob(result.data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });

        // create clickable link to view pdf
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.filename || quoteId + '.pdf';
        document.body.appendChild(a);
        a.click();

        // clean up the object
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Błąd: ' + result.error);
      }
    } catch (e) {
      console.error(e);
      alert('Wystąpił nieoczekiwany błąd.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleDownload} disabled={isLoading}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generowanie...
        </>
      ) : (
        <>
          <FileDown className="mr-2 h-4 w-4" />
          Pobierz Ofertę PDF
        </>
      )}
    </Button>
  );
}
