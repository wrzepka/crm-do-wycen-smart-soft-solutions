'use client';

import { useFormContext } from 'react-hook-form';
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { QuoteFormValues } from './quote-editor'; // Importujemy nasz typ frontendowy

export function QuoteContextSection({ clients, projects }: { clients: any[], projects: any[] }) {
    // Generyk QuoteFormValues zapewnia, że TS widzi pole quote_date
    const { control, watch } = useFormContext<QuoteFormValues>();
    const selectedClientId = watch('client_id');

    const filteredProjects = projects.filter(p => p.client_id === selectedClientId);

    return (
        <div className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Klient */}
                <FormField
                    control={control}
                    name="client_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Klient</FormLabel>
                            <Select
                                // Rzutowanie na string dla Selecta (value nie może być null)
                                value={field.value ? String(field.value) : undefined}
                                onValueChange={(val) => field.onChange(Number(val))}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Wybierz klienta" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {clients.map((client) => (
                                        <SelectItem key={client.id} value={String(client.id)}>
                                            {client.first_name} {client.last_name}
                                            <span className="ml-2 text-xs text-muted-foreground">({client.email})</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="quote_date"
                    // Ponieważ schemat Zod backendu nie sprawdza daty (jest ona tam pominięta),
                    // musimy dodać walidację 'required' na poziomie React Hook Form
                    rules={{ required: 'Data wystawienia jest wymagana' }}
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Data wystawienia</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full pl-3 text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                            )}
                                        >
                                            {field.value ? (
                                                format(field.value, "PPP", { locale: pl })
                                            ) : (
                                                <span>Wybierz datę</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        // DayPicker wymaga undefined zamiast null
                                        selected={field.value || undefined}
                                        onSelect={field.onChange}
                                        initialFocus
                                        locale={pl}
                                    />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>


        </div>
    );
}