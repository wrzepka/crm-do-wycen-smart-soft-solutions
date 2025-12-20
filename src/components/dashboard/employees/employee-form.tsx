'use client'; // Marking as Client Component

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
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
import { Calendar } from '@/components/ui/calendar';
import { newEmployeeSchema } from '@/lib/schemas/employeeSchema';
import { createEmployee, updateEmployee } from '@/lib/actions/employee-actions';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, User, Briefcase, CalendarIcon } from 'lucide-react';
import { pl } from 'date-fns/locale';
// Importing specific type to fix "Unexpected any" lint error
import { EmployeeWithRelations } from '@/types/employee';

// Deriving form values type directly from Zod schema
type EmployeeFormValues = z.input<typeof newEmployeeSchema>;

interface EmployeeFormProps {
  // Using strict type with null support for database compatibility
  initialData?: EmployeeWithRelations | null;
  onSuccess?: () => void;
}

export function EmployeeForm({ initialData, onSuccess }: EmployeeFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(newEmployeeSchema),
    defaultValues: {
      first_name: initialData?.first_name || '',
      last_name: initialData?.last_name || '',
      // Safely casting status to match schema type avoiding explicit any
      status: initialData?.status
        ? (initialData.status as EmployeeFormValues['status'])
        : 'ACTIVE_AVAILABLE',
      busy_from: initialData?.busy_from ? new Date(initialData.busy_from) : undefined,
      busy_to: initialData?.busy_to ? new Date(initialData.busy_to) : undefined,
    },
  });

  async function onSubmit(values: EmployeeFormValues) {
    startTransition(async () => {
      const formData = new FormData();
      // Iterating over values to append them to FormData
      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (value instanceof Date) {
            formData.append(key, value.toISOString());
          } else {
            formData.append(key, value as string);
          }
        }
      });

      let result;
      // Determining whether to update or create based on ID existence
      if (initialData?.id) {
        result = await updateEmployee(initialData.id, formData);
      } else {
        result = await createEmployee(formData);
      }

      // Handling response and feedback
      if (result.ok) {
        toast.success(initialData ? 'Zapisano zmiany' : 'Dodano pracownika');
        router.refresh();
        if (onSuccess) onSuccess();
      } else {
        toast.error(result.error || 'Wystąpił błąd');
      }
    });
  }

  // Helper function to format Date to YYYY-MM-DD string
  const dateToIso = (date?: Date | null) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-2">
        {/* Main container with visual grouping */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-5 space-y-6">
          {/* Personal details section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-400 mb-2 border-b border-slate-800 pb-2">
              <User size={14} className="text-blue-500" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Dane personalne
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-slate-500">Imię</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Jan"
                        {...field}
                        className="bg-slate-950 border-slate-800 focus:border-blue-500/50 text-sm h-9 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-slate-500">Nazwisko</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Kowalski"
                        {...field}
                        className="bg-slate-950 border-slate-800 focus:border-blue-500/50 text-sm h-9 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Status and availability section */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-slate-400 mb-2 border-b border-slate-800 pb-2">
              <Briefcase size={14} className="text-amber-500" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Dostępność
              </span>
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-slate-500">Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value as string}
                    value={field.value as string}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-slate-950 border-slate-800 text-white h-9 focus:ring-0 focus:border-blue-500/50">
                        <SelectValue placeholder="Wybierz status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-[#0B1121] border-slate-800 text-slate-200">
                      <SelectItem value="ACTIVE_AVAILABLE">
                        <span className="text-emerald-400">●</span> Dostępny
                      </SelectItem>
                      <SelectItem value="ACTIVE_BOOKED">
                        <span className="text-amber-400">●</span> W projekcie
                      </SelectItem>
                      <SelectItem value="ON_LEAVE">
                        <span className="text-slate-400">●</span> Urlop
                      </SelectItem>
                      <SelectItem value="ONBOARDING">
                        <span className="text-purple-400">●</span> Wdrożenie
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* Start date input with calendar popover */}
              <FormField
                control={form.control}
                name="busy_from"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-xs text-slate-500">Zajęty od</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type="date"
                          value={field.value ? dateToIso(field.value) : ''}
                          onChange={(e) => {
                            const d = e.target.value ? new Date(e.target.value) : undefined;
                            field.onChange(d);
                          }}
                          className="bg-slate-950 border-slate-800 text-white block focus:border-blue-500/50 h-9 pr-10 [&::-webkit-calendar-picker-indicator]:hidden dark:[color-scheme:dark]"
                        />
                      </FormControl>

                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-9 w-9 text-slate-400 hover:text-white hover:bg-slate-800"
                          >
                            <CalendarIcon size={14} />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto p-0 bg-[#0B1121] border-slate-800"
                          align="end"
                        >
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={(date) => field.onChange(date)}
                            initialFocus
                            locale={pl}
                            className="text-white"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* End date input with calendar popover */}
              <FormField
                control={form.control}
                name="busy_to"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-xs text-slate-500">Zajęty do</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type="date"
                          value={field.value ? dateToIso(field.value) : ''}
                          onChange={(e) => {
                            const d = e.target.value ? new Date(e.target.value) : undefined;
                            field.onChange(d);
                          }}
                          className="bg-slate-950 border-slate-800 text-white block focus:border-blue-500/50 h-9 pr-10 [&::-webkit-calendar-picker-indicator]:hidden dark:[color-scheme:dark]"
                        />
                      </FormControl>

                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-9 w-9 text-slate-400 hover:text-white hover:bg-slate-800"
                          >
                            <CalendarIcon size={14} />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto p-0 bg-[#0B1121] border-slate-800"
                          align="end"
                        >
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={(date) => field.onChange(date)}
                            initialFocus
                            locale={pl}
                            className="text-white"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        {/* Footer with submit button */}
        <div className="pt-2">
          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white h-9 text-sm font-medium shadow-md shadow-blue-900/10 transition-all"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Przetwarzanie...
              </>
            ) : initialData ? (
              'Zapisz zmiany'
            ) : (
              'Dodaj pracownika'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
