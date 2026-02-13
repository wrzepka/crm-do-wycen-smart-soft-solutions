'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    MoreHorizontal,
    FileText,
    Pencil,
    Trash2,
    Mail,
    History,
    Loader2
} from 'lucide-react';
import { format, addDays, isPast } from 'date-fns';
import { pl } from 'date-fns/locale';
import { toast } from 'sonner';

import { generateQuotePdfAction, sendExistingQuotePdfAction } from '@/lib/actions/pdf-actions';
import { deletePricingHistory } from '@/lib/actions/pricing-actions';
import { QuoteHistorySheet } from './quote-history-sheet';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// Zaktualizowany typ (dodano total_cost)
type QuoteWithRelations = {
    id: number;
    quote_code: string | null;
    quote_date: Date;
    status: string;
    total_net: any;
    total_cost: any; // <--- WYMAGANE DO OBLICZENIA MARŻY
    client: {
        first_name: string;
        last_name: string;
        email: string;
    };
    project?: {
        project_details: {
            project_name: string | null;
        }[];
    } | null;
};

interface QuoteListTableProps {
    data: QuoteWithRelations[];
}

const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' }> = {
    DRAFT: { label: 'Szkic', variant: 'secondary' },
    SENT: { label: 'Wysłana', variant: 'default' },
    ACCEPTED: { label: 'Zaakceptowana', variant: 'success' },
    REJECTED: { label: 'Odrzucona', variant: 'destructive' },
    CANCELLED: { label: 'Anulowana', variant: 'outline' },
};

const QuoteActions = ({ quote }: { quote: QuoteWithRelations }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    const handlePreview = async () => {
        setIsLoading(true);
        try {
            const result = await generateQuotePdfAction(quote.id);
            if (result.ok && result.fileName) {
                const url = `/api/quotes/download/${result.fileName}`;
                window.open(url, '_blank');
            } else {
                toast.error(result.error || "Nie udało się wygenerować PDF");
            }
        } catch (error) {
            console.error(error);
            toast.error("Wystąpił błąd połączenia");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendEmail = async () => {
        if (!quote.client.email) {
            toast.error("Ten klient nie ma adresu e-mail.");
            return;
        }

        setIsSending(true);
        try {
            const genResult = await generateQuotePdfAction(quote.id);
            if (!genResult.ok) {
                toast.error(genResult.error || "Błąd generowania pliku PDF przed wysyłką");
                return;
            }

            const sendResult = await sendExistingQuotePdfAction(quote.id);
            if (sendResult.ok) {
                toast.success(sendResult.message || "E-mail został wysłany!");
            } else {
                toast.error(sendResult.error || "Błąd wysyłki e-maila");
            }
        } catch (error) {
            console.error(error);
            toast.error("Wystąpił błąd krytyczny");
        } finally {
            setIsSending(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const result = await deletePricingHistory({ id: quote.id });
            if (result.ok) {
                toast.success(result.message || "Wycena została usunięta");
            } else {
                toast.error(result.error || "Błąd podczas usuwania wyceny");
            }
        } catch (error) {
            console.error(error);
            toast.error("Wystąpił błąd podczas usuwania");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400">
                        <span className="sr-only">Otwórz menu</span>
                        {isLoading || isSending || isDeleting ? (
                            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                        ) : (
                            <MoreHorizontal className="h-4 w-4" />
                        )}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Akcje</DropdownMenuLabel>
                    <DropdownMenuItem onClick={(e) => { e.preventDefault(); handlePreview(); }} disabled={isLoading || isSending || isDeleting} className="cursor-pointer">
                        <FileText className="mr-2 h-4 w-4" />
                        {isLoading ? "Generowanie..." : "Podgląd PDF"}
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild disabled={isDeleting}>
                        <Link href={`/dashboard/quotes/${quote.id}/edit`} className="cursor-pointer flex items-center">
                            <Pencil className="mr-2 h-4 w-4" /> Edytuj
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={(e) => { e.preventDefault(); handleSendEmail(); }} disabled={isLoading || isSending || isDeleting || !quote.client.email} className="cursor-pointer">
                        <Mail className="mr-2 h-4 w-4" />
                        {isSending ? "Wysyłanie..." : "Wyślij e-mail"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.preventDefault(); setIsHistoryOpen(true); }} className="cursor-pointer">
                        <History className="mr-2 h-4 w-4" /> Historia wersji
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {quote.status === 'DRAFT' ? (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600 cursor-pointer" disabled={isLoading || isSending || isDeleting}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    {isDeleting ? "Usuwanie..." : "Usuń"}
                                </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Czy na pewno chcesz usunąć tę wycenę?</AlertDialogTitle>
                                    <AlertDialogDescription>Ta operacja jest nieodwracalna.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Anuluj</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">Usuń trwale</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    ) : (
                        <DropdownMenuItem disabled className="text-muted-foreground italic"><Trash2 className="mr-2 h-4 w-4" /> Usuń (Tylko szkice)</DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
            {isHistoryOpen && <QuoteHistorySheet isOpen={isHistoryOpen} onOpenChange={setIsHistoryOpen} quoteCode={quote.quote_code} />}
        </>
    );
};

export function QuoteListTable({ data }: QuoteListTableProps) {
    const getInitials = (first: string, last: string) => `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();

    return (
        <div className="rounded-xl border bg-white dark:bg-[#0B1121] border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <Table>
                <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                    <TableRow className="border-slate-200 dark:border-slate-800 hover:bg-transparent">
                        <TableHead className="w-[140px] text-slate-500 font-semibold pl-6">Nr Oferty</TableHead>
                        {/* Klient - brak stałej szerokości, rozciągnie się */}
                        <TableHead className="text-slate-500 font-semibold">Klient</TableHead>
                        <TableHead className="text-right text-slate-500 font-semibold w-[150px]">Wartość (Netto)</TableHead>
                        {/* NOWA KOLUMNA MARŻY */}
                        <TableHead className="text-right text-slate-500 font-semibold w-[120px]">Marża</TableHead>
                        <TableHead className="text-slate-500 font-semibold w-[140px]">Ważność</TableHead>
                        <TableHead className="text-slate-500 font-semibold w-[130px]">Status</TableHead>
                        <TableHead className="w-[50px] text-right pr-6"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center">Brak ofert spełniających kryteria.</TableCell>
                        </TableRow>
                    ) : (
                        data.map((quote) => {
                            const expiryDate = addDays(new Date(quote.quote_date), 30);
                            const isExpired = isPast(expiryDate) && quote.status === 'SENT';
                            const statusConfig = statusMap[quote.status] || { label: quote.status, variant: 'outline' };

                            // Obliczenia finansowe
                            const totalNet = Number(quote.total_net);
                            const totalCost = Number(quote.total_cost || 0); // Zabezpieczenie na null
                            const margin = totalNet - totalCost;
                            const marginPercent = totalNet > 0 ? (margin / totalNet) * 100 : 0;

                            // Logika koloru marży
                            let marginColorClass = "text-slate-500";
                            if (marginPercent >= 30) marginColorClass = "text-emerald-600 font-medium";
                            else if (marginPercent < 15) marginColorClass = "text-amber-500";

                            return (
                                <TableRow key={quote.id} className="border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                    <TableCell className="font-medium font-mono pl-6">
                                        <Link href={`/dashboard/quotes/${quote.id}/edit`} className="hover:underline text-primary dark:text-blue-400 text-sm">
                                            {quote.quote_code || `ID: ${quote.id}`}
                                        </Link>
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-semibold">
                                                    {getInitials(quote.client.first_name, quote.client.last_name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-slate-900 dark:text-white">
                                                    {quote.client.first_name} {quote.client.last_name}
                                                </span>
                                                <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                                                    {quote.client.email}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>

                                    <TableCell className="text-right">
                                        <span className="font-bold text-slate-900 dark:text-slate-200 text-sm">
                                            {totalNet.toLocaleString('pl-PL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} zł
                                        </span>
                                    </TableCell>

                                    {/* NOWA KOMÓRKA MARŻY */}
                                    <TableCell className="text-right">
                                        <div className="flex flex-col items-end">
                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                {margin.toLocaleString('pl-PL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} zł
                                            </span>
                                            <span className={`text-[10px] ${marginColorClass}`}>
                                                {marginPercent.toFixed(1)}%
                                            </span>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <div className={`flex flex-col text-sm ${isExpired ? 'text-red-600 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                                            <span>{format(expiryDate, 'dd MMM yyyy', { locale: pl })}</span>
                                            {isExpired && <span className="text-[10px]">Przeterminowana</span>}
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <Badge variant={statusConfig.variant as any} className={`text-[10px] px-2 py-0.5 ${quote.status === 'ACCEPTED' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}`}>
                                            {statusConfig.label}
                                        </Badge>
                                    </TableCell>

                                    <TableCell className="text-right pr-6">
                                        <QuoteActions quote={quote} />
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </div>
    );
}