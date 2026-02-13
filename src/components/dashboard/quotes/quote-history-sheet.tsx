'use client';

import { useState, useEffect } from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Eye, Check } from 'lucide-react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import Link from 'next/link';
import { getQuoteVersionsAction } from '@/lib/actions/pricing-actions';

interface QuoteHistorySheetProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    quoteCode: string | null;
}

export function QuoteHistorySheet({ isOpen, onOpenChange, quoteCode }: QuoteHistorySheetProps) {
    const [versions, setVersions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen && quoteCode) {
            const fetchHistory = async () => {
                setIsLoading(true);
                const result = await getQuoteVersionsAction(quoteCode);
                if (result.ok && result.data) {
                    setVersions(result.data);
                }
                setIsLoading(false);
            };
            fetchHistory();
        }
    }, [isOpen, quoteCode]);

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            {/* ZMIANA: Stylizacja zgodna z client-sheet.tsx i employee-sheet.tsx */}
            <SheetContent className="bg-[#0B1121] border-l border-slate-800 text-white sm:max-w-md overflow-y-auto">
                <SheetHeader>
                    <SheetTitle className="text-white text-xl font-bold">Historia wersji</SheetTitle>
                    <SheetDescription className="text-slate-400">
                        Numer oferty: <span className="font-mono font-bold text-white">{quoteCode}</span>
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-8">
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                        </div>
                    ) : versions.length === 0 ? (
                        <p className="text-center text-sm text-slate-500 py-4">Brak historii wersji.</p>
                    ) : (
                        <div className="space-y-4">
                            {versions.map((v) => (
                                <div
                                    key={v.id}
                                    // ZMIANA: Stylizacja kart dla ciemnego tła
                                    className={`flex flex-col gap-2 p-3 rounded-lg border transition-colors ${v.is_current_version
                                            ? 'bg-blue-950/30 border-blue-800' // Aktywna wersja (ciemny niebieski)
                                            : 'bg-slate-900/50 border-slate-800 hover:border-slate-700' // Nieaktywna (ciemny slate)
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="font-mono text-slate-300 border-slate-700">v{v.version}</Badge>
                                            <span className="text-xs text-slate-400">
                                                {format(new Date(v.quote_date), 'dd MMM yyyy', { locale: pl })}
                                            </span>
                                        </div>
                                        <Badge
                                            variant={v.status === 'SENT' ? 'default' : 'secondary'}
                                            className={`text-[10px] ${v.status !== 'SENT' ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : ''}`}
                                        >
                                            {v.status}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center justify-between mt-1">
                                        <span className="font-bold text-sm text-slate-200">
                                            {v.total_gross.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł
                                        </span>

                                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-400 hover:text-white hover:bg-slate-800" asChild>
                                            <Link href={`/dashboard/quotes/${v.id}/edit`}>
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>

                                    {v.is_current_version && (
                                        <div className="flex items-center gap-1 text-[10px] text-blue-400 font-medium mt-1">
                                            <Check className="h-3 w-3" /> Aktualna wersja
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}