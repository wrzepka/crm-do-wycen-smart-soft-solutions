// src/components/dashboard/quotes/editor/quote-version-selector.tsx

'use client';

import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CopyPlus, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { createNextVersionAction } from '@/lib/actions/pricing-actions';
import { toast } from 'sonner';

interface QuoteVersionSelectorProps {
    currentId: number;
    quoteCode: string | null;
    versions: any[];
}

export function QuoteVersionSelector({ currentId, quoteCode, versions }: QuoteVersionSelectorProps) {
    const router = useRouter();
    const [isCreating, setIsCreating] = useState(false);

    const handleVersionChange = (value: string) => {
        // Przekieruj do edycji wybranej wersji
        router.push(`/dashboard/quotes/${value}/edit`);
    };

    const handleCreateVersion = async () => {
        if (!confirm('Czy chcesz utworzyć nową wersję tej oferty?')) return;

        setIsCreating(true);
        try {
            const result = await createNextVersionAction(currentId);

            if (result.ok && result.newId) {
                toast.success(result.message);
                router.push(`/dashboard/quotes/${result.newId}/edit`);
            } else {
                toast.error(result.error || 'Błąd tworzenia wersji');
            }
        } catch (error) {
            console.error(error);
            toast.error('Błąd krytyczny');
        } finally {
            setIsCreating(false);
        }
    };

    // Jeśli to nowa oferta (bez kodu) lub brak wersji, nie wyświetlaj nic
    if (!quoteCode || versions.length === 0) return null;

    return (
        <div className="flex flex-col gap-3 p-4 mb-6 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800">

            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase">Wersja oferty</span>
                <Badge variant="outline" className="text-[10px]">v{versions.find(v => v.id === currentId)?.version || '?'}</Badge>
            </div>

            <Select value={currentId.toString()} onValueChange={handleVersionChange}>
                <SelectTrigger className="w-full bg-white dark:bg-slate-950">
                    <SelectValue placeholder="Wybierz wersję" />
                </SelectTrigger>
                <SelectContent>
                    {versions.map((v) => (
                        <SelectItem key={v.id} value={v.id.toString()}>
                            <div className="flex items-center justify-between w-full gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">v{v.version}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {/* Używamy quote_date zgodnie z Twoim modelem */}
                                        {format(new Date(v.quote_date), 'dd.MM.yyyy')}
                                    </span>
                                </div>
                                <Badge variant={v.status === 'SENT' ? 'default' : 'secondary'} className="text-[10px] h-5">
                                    {v.status}
                                </Badge>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Button
                onClick={handleCreateVersion}
                disabled={isCreating}
                variant="secondary"
                size="sm"
                className="w-full mt-1"
            >
                {isCreating ? <Loader2 className="h-3 w-3 mr-2 animate-spin" /> : <CopyPlus className="h-3 w-3 mr-2" />}
                Utwórz nową wersję
            </Button>
        </div>
    );
}