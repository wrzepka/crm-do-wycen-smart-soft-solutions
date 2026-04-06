'use client';

import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
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
import { QuoteFormValues } from './quote-editor';

// Define minimal client type needed for this component
type ClientOption = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  company_name?: string | null;
};

interface QuoteContextSectionProps {
  clients: ClientOption[];
}

export function QuoteContextSection({ clients }: QuoteContextSectionProps) {
  const { control } = useFormContext<QuoteFormValues>();

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Client selection */}
        <FormField
          control={control}
          name="client_id"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Klient</FormLabel>
              <Select
                value={field.value ? String(field.value) : undefined}
                onValueChange={(val) => field.onChange(Number(val))}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Wybierz klienta" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem
                      key={client.id}
                      value={String(client.id)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center max-w-[280px] sm:max-w-[400px] md:max-w-[200px] lg:max-w-[300px]">
                        <span className="truncate font-medium">
                          {client.first_name} {client.last_name}
                        </span>
                        <span className="ml-2 text-xs text-muted-foreground truncate hidden sm:inline-block">
                          ({client.email})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Issue date */}
        <FormField
          control={control}
          name="quote_date"
          rules={{ required: 'Data wystawienia jest wymagana' }}
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data wystawienia</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-full pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground',
                      )}
                    >
                      {field.value ? (
                        format(field.value, 'PPP', { locale: pl })
                      ) : (
                        <span>Wybierz datę</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50 shrink-0" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
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
