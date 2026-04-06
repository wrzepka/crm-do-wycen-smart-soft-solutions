'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Send, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { generateQuotePdfAction, sendExistingQuotePdfAction } from '@/lib/actions/pdf-actions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface QuoteActionsProps {
  quoteId: number;
  clientEmail: string;
  isPdfGenerated: boolean;
}

// TODO: Move to the /qoutes folder?
export function QuoteActionsBar({ quoteId, clientEmail, isPdfGenerated }: QuoteActionsProps) {
  const [hasFile, setHasFile] = useState(isPdfGenerated);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Generate pdf section
  const handleGenerate = async () => {
    setIsGenerating(true);

    const result = await generateQuotePdfAction(quoteId);

    setIsGenerating(false);

    if (result.ok && result.previewUrl) {
      setHasFile(true);

      toast.success('PDF został wygenerowany', {
        description: 'Możesz teraz otworzyć podgląd lub wysłać ofertę.',
        action: {
          label: 'Otwórz PDF',
          onClick: () => window.open(result.previewUrl, '_blank'),
        },
        duration: 5000,
      });
    } else {
      toast.error('Błąd generowania', {
        description: result.error || 'Wystąpił nieoczekiwany błąd.',
      });
    }
  };

  // Send pdf section
  const handleSend = async () => {
    setIsSending(true);

    const result = await sendExistingQuotePdfAction(quoteId);

    setIsSending(false);
    setIsDialogOpen(false);

    if (result.ok) {
      toast.success('Wysłano pomyślnie!', {
        description: `Oferta poleciała na adres ${clientEmail}`,
      });
    } else {
      const isFileMissing = result.error?.includes('Kliknij najpierw');

      toast.error('Nie udało się wysłać', {
        description: result.error,
        action: isFileMissing
          ? {
              label: 'Generuj teraz',
              onClick: handleGenerate,
            }
          : undefined,
      });
    }
  };

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <Button
        variant="outline"
        onClick={handleGenerate}
        disabled={isGenerating || isSending}
        className="min-w-[140px]"
      >
        {isGenerating ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : hasFile ? (
          <RefreshCw className="mr-2 h-4 w-4" />
        ) : (
          <FileText className="mr-2 h-4 w-4" />
        )}
        {isGenerating ? 'Generowanie...' : hasFile ? 'Regeneruj PDF' : 'Generuj PDF'}
      </Button>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogTrigger asChild>
          <Button disabled={isGenerating || isSending} variant="default">
            <Send className="mr-2 h-4 w-4" />
            Wyślij Ofertę
          </Button>
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Potwierdzenie wysyłki</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              {hasFile ? (
                <span>
                  Czy na pewno chcesz wysłać obecną wersję oferty na adres: <br />
                  <span className="font-bold text-foreground">{clientEmail}</span>?
                </span>
              ) : (
                <div className="flex items-center gap-2 text-amber-600 font-medium bg-amber-50 p-3 rounded-md border border-amber-200">
                  <AlertCircle className="h-5 w-5" />
                  Uwaga: Plik PDF nie został jeszcze wygenerowany!
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSending}>Anuluj</AlertDialogCancel>

            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleSend();
              }}
              disabled={isSending || !hasFile}
              className={
                !hasFile ? 'opacity-50 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }
            >
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wysyłanie...
                </>
              ) : (
                'Tak, wyślij'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
