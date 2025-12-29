'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useTransition, useState } from 'react';
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { newEmployeeSchema } from '@/lib/schemas/employeeSchema';
import { createEmployee, updateEmployee } from '@/lib/actions/employee-actions';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, User, Briefcase, CalendarIcon, Cpu, Plus, X, Check } from 'lucide-react';
import { pl } from 'date-fns/locale';
import { EmployeeWithRelations } from '@/types/employee';
import { getColorForTechnology } from '@/lib/utils';

type EmployeeFormValues = z.input<typeof newEmployeeSchema>;

interface EmployeeFormProps {
  initialData?: EmployeeWithRelations | null;
  onSuccess?: () => void;
  allTechnologies: { id: number; name: string }[];
  allPositions: { id: number; name: string }[];
}

export function EmployeeForm({
  initialData,
  onSuccess,
  allTechnologies,
  allPositions,
}: EmployeeFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [techOpen, setTechOpen] = useState(false);

  // map initial technologies to array of ids
  const defaultTechIds = initialData?.employee_technology?.map((et) => et.technology_id) || [];

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(newEmployeeSchema),
    defaultValues: {
      first_name: initialData?.first_name || '',
      last_name: initialData?.last_name || '',
      status: initialData?.status
        ? (initialData.status as EmployeeFormValues['status'])
        : 'ACTIVE_AVAILABLE',
      busy_from: initialData?.busy_from ? new Date(initialData.busy_from) : undefined,
      busy_to: initialData?.busy_to ? new Date(initialData.busy_to) : undefined,
      position_id: initialData?.position?.id || undefined,
      technologyIds: defaultTechIds,
    },
  });

  async function onSubmit(values: EmployeeFormValues) {
    startTransition(async () => {
      const formData = new FormData();

      // flatten values to formdata for server action compatibility
      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'technologyIds' && Array.isArray(value)) {
            // handle technology array by appending multiple entries
            value.forEach((id) => {
              formData.append('technology_ids', id.toString());
            });
          } else if (value instanceof Date) {
            formData.append(key, value.toISOString());
          } else {
            formData.append(key, value as string);
          }
        }
      });

      let result;
      if (initialData?.id) {
        result = await updateEmployee(initialData.id, formData);
      } else {
        result = await createEmployee(formData);
      }

      if (result.ok) {
        toast.success(initialData ? 'Zapisano zmiany' : 'Dodano pracownika');
        router.refresh();
        if (onSuccess) onSuccess();
      } else {
        toast.error(result.error || 'Wystąpił błąd');
      }
    });
  }

  const dateToIso = (date?: Date | null) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-2">
        <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-5 space-y-6">
          {/* personal details section */}
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

            <FormField
              control={form.control}
              name="position_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-slate-500">Stanowisko</FormLabel>
                  <Select
                    onValueChange={(val) => field.onChange(Number(val))}
                    value={field.value ? field.value.toString() : undefined}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-slate-950 border-slate-800 text-white h-9 focus:ring-0 focus:border-blue-500/50">
                        <SelectValue placeholder="Wybierz stanowisko" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-[#0B1121] border-slate-800 text-slate-200">
                      {allPositions.map((position) => (
                        <SelectItem key={position.id} value={position.id.toString()}>
                          {position.name}
                        </SelectItem>
                      ))}
                      {allPositions.length === 0 && (
                        <div className="p-2 text-xs text-slate-500 text-center">
                          Brak zdefiniowanych stanowisk
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* technologies section */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-slate-400 mb-2 border-b border-slate-800 pb-2">
              <Cpu size={14} className="text-purple-500" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Kompetencje
              </span>
            </div>

            <FormField
              control={form.control}
              name="technologyIds"
              render={({ field }) => {
                const selectedIds = (field.value as number[]) || [];

                return (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-xs text-slate-500">Znane technologie</FormLabel>
                    <div className="flex flex-wrap items-center gap-2 min-h-[38px] rounded-md border border-slate-800 bg-slate-950 px-3 py-2">
                      {selectedIds.length > 0 ? (
                        selectedIds.map((techId) => {
                          const tech = allTechnologies.find((t) => t.id === techId);
                          if (!tech) return null;
                          return (
                            <Badge
                              key={tech.id}
                              variant="outline"
                              className={`group pr-5 pl-2 py-0.5 border ${getColorForTechnology(
                                tech.name,
                              )} relative`}
                            >
                              {tech.name}
                              <button
                                type="button"
                                onClick={() => {
                                  const newIds = selectedIds.filter((id) => id !== tech.id);
                                  field.onChange(newIds);
                                }}
                                className="absolute right-1 top-1/2 -translate-y-1/2 opacity-60 group-hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/20 rounded-full p-0.5 transition-all"
                              >
                                <X size={10} />
                              </button>
                            </Badge>
                          );
                        })
                      ) : (
                        <span className="text-sm text-slate-500">Brak wybranych technologii</span>
                      )}

                      <Popover open={techOpen} onOpenChange={setTechOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            type="button"
                            className="h-6 w-6 rounded-full border border-dashed border-slate-600 text-slate-400 hover:text-white hover:border-slate-400 p-0 ml-1"
                          >
                            <Plus size={12} />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="p-0 w-[240px] border-slate-800 bg-[#0B1121]"
                          align="start"
                        >
                          <Command className="bg-transparent">
                            <CommandInput
                              placeholder="Szukaj technologii..."
                              className="h-9 text-xs text-white"
                            />
                            <CommandList>
                              <CommandEmpty className="py-2 text-xs text-center text-slate-500">
                                Brak wyników.
                              </CommandEmpty>
                              <CommandGroup>
                                {allTechnologies.map((tech) => {
                                  const isSelected = selectedIds.includes(tech.id);
                                  return (
                                    <CommandItem
                                      key={tech.id}
                                      value={tech.name}
                                      onSelect={() => {
                                        if (isSelected) {
                                          field.onChange(
                                            selectedIds.filter((id) => id !== tech.id),
                                          );
                                        } else {
                                          field.onChange([...selectedIds, tech.id]);
                                        }
                                      }}
                                      className="cursor-pointer text-xs text-slate-300 aria-selected:bg-slate-800 aria-selected:text-white flex justify-between"
                                    >
                                      {tech.name}
                                      {isSelected && (
                                        <Check size={12} className="text-emerald-500" />
                                      )}
                                    </CommandItem>
                                  );
                                })}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </div>

          {/* availability and dates section */}
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
                            type="button"
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
                            type="button"
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

        <div className="pt-2">
          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white h-9 text-sm font-medium shadow-md shadow-blue-900/10 transition-all cursor-pointer"
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
