'use client';

import Link from 'next/link';
import {
    MoreHorizontal,
    FileText,
    Pencil,
    Trash2,
    Mail,
    History
} from 'lucide-react';
import { format, addDays, isPast } from 'date-fns';
import { pl } from 'date-fns/locale';

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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// Typy pomocnicze
type QuoteWithRelations = {
    id: number;
    quote_code: string | null;
    quote_date: Date;
    status: string; // lub QuoteStatus
    total_net: any; // Decimal z Prisma
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

// Mapowanie statusów na kolory i etykiety
const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' }> = {
    DRAFT: { label: 'Szkic', variant: 'secondary' }, // Szary
    SENT: { label: 'Wysłana', variant: 'default' }, // Czarny/Primary (lub niebieski w CSS)
    ACCEPTED: { label: 'Zaakceptowana', variant: 'success' }, // Zielony (wymaga klasy w globals.css lub użycia outline z kolorem)
    REJECTED: { label: 'Odrzucona', variant: 'destructive' }, // Czerwony
    CANCELLED: { label: 'Anulowana', variant: 'outline' },
};

export function QuoteListTable({ data }: QuoteListTableProps) {

    // Funkcja pomocnicza do inicjałów
    const getInitials = (first: string, last: string) => {
        return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
    };

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[150px]">Nr Oferty</TableHead>
                    <TableHead>Klient</TableHead>
                    <TableHead>Projekt</TableHead>
                    <TableHead className="text-right">Wartość (Netto)</TableHead>
                    <TableHead>Ważność</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                            Brak ofert spełniających kryteria.
                        </TableCell>
                    </TableRow>
                ) : (
                    data.map((quote) => {
                        // Logika daty ważności (zakładamy 30 dni od wystawienia)
                        const expiryDate = addDays(new Date(quote.quote_date), 30);
                        const isExpired = isPast(expiryDate) && quote.status === 'SENT';

                        // Pobranie nazwy projektu (pierwszy z details lub placeholder)
                        const projectName = quote.project?.project_details[0]?.project_name || '-';

                        // Status config
                        const statusConfig = statusMap[quote.status] || { label: quote.status, variant: 'outline' };

                        return (
                            <TableRow key={quote.id}>
                                {/* Nr Oferty */}
                                <TableCell className="font-medium font-mono">
                                    <Link href={`/dashboard/quotes/${quote.id}`} className="hover:underline text-primary">
                                        {quote.quote_code || `ID: ${quote.id}`}
                                    </Link>
                                </TableCell>

                                {/* Klient */}
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                                                {getInitials(quote.client.first_name, quote.client.last_name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">
                                                {quote.client.first_name} {quote.client.last_name}
                                            </span>
                                            <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                                                {quote.client.email}
                                            </span>
                                        </div>
                                    </div>
                                </TableCell>

                                {/* Projekt */}
                                <TableCell className="text-sm text-muted-foreground">
                                    {projectName}
                                </TableCell>

                                {/* Wartość */}
                                <TableCell className="text-right font-bold">
                                    {Number(quote.total_net).toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł
                                </TableCell>

                                {/* Data ważności */}
                                <TableCell>
                                    <div className={`flex flex-col text-sm ${isExpired ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
                                        <span>{format(expiryDate, 'dd MMM yyyy', { locale: pl })}</span>
                                        {isExpired && <span className="text-[10px]">Przeterminowana</span>}
                                    </div>
                                </TableCell>

                                {/* Status */}
                                <TableCell>
                                    <Badge variant={statusConfig.variant as any} className={quote.status === 'ACCEPTED' ? 'bg-green-600 hover:bg-green-700' : ''}>
                                        {statusConfig.label}
                                    </Badge>
                                </TableCell>

                                {/* Akcje */}
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Otwórz menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Akcje</DropdownMenuLabel>
                                            <DropdownMenuItem asChild>
                                                <Link href={`/dashboard/quotes/${quote.id}/edit`}>
                                                    <Pencil className="mr-2 h-4 w-4" /> Edytuj
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link href={`/dashboard/quotes/${quote.id}`}>
                                                    <FileText className="mr-2 h-4 w-4" /> Podgląd
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => alert('Wysyłka e-maila - do implementacji')}>
                                                <Mail className="mr-2 h-4 w-4" /> Wyślij e-mail
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => alert('Historia zmian - do implementacji')}>
                                                <History className="mr-2 h-4 w-4" /> Historia wersji
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-red-600" onClick={() => alert('Usuwanie - użyj Server Action')}>
                                                <Trash2 className="mr-2 h-4 w-4" /> Usuń
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        );
                    })
                )}
            </TableBody>
        </Table>
    );
}