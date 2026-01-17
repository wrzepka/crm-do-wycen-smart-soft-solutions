'use client';

import { useState, useMemo } from 'react';
import { useForm, useFieldArray, useWatch, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Calculator, Loader2, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

import {
  createServiceTemplateWithResourcesSchema,
  updateServiceTemplateWithResourcesSchema,
} from '@/lib/schemas/serviceSchema';

import {
  createServiceTemplate,
  updateServiceTemplate,
} from '@/lib/actions/service-actions';

import {
  CreateServiceTemplateInput,
  UpdateServiceTemplateInput,
} from '@/types/services';

// type definition for position matching database structure
export interface PositionOption {
  id: number;
  name: string;
  hourlyRate: number;
}

// modify form type to allow nullable id during creation
export type ServiceFormValues = Omit<z.input<typeof updateServiceTemplateWithResourcesSchema>, 'id'> & {
  id?: string | null;
};

interface ServiceFormProps {
  initialData?: Partial<ServiceFormValues>;
  availablePositions: PositionOption[];
  onSuccess: () => void;
}

export function ServiceForm({ initialData, availablePositions, onSuccess }: ServiceFormProps) {
  const [isPending, setIsPending] = useState(false);

  // determine edit mode based on the presence of id in initial data
  const isEditMode = !!initialData?.id;

  const schema = isEditMode
    ? updateServiceTemplateWithResourcesSchema
    : createServiceTemplateWithResourcesSchema;

  const form = useForm<ServiceFormValues>({
    // @ts-expect-error: complex zod unions cause strict type mismatch with rhf resolver but runtime is fine
    resolver: zodResolver(schema),
    defaultValues: {
      id: initialData?.id,
      name: initialData?.name || '',
      description: initialData?.description || '',
      isActive: initialData?.isActive ?? true,
      defaultMargin: initialData?.defaultMargin ?? 20,
      resources: initialData?.resources || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'resources',
  });

  // watch form values to update calculations in real time
  const watchedResources = useWatch({ control: form.control, name: 'resources' });
  const watchedMargin = useWatch({ control: form.control, name: 'defaultMargin' });

  // calculate totals and profit on the fly
  const summary = useMemo(() => {
    let totalBaseCost = 0;
    let totalHours = 0;

    watchedResources?.forEach((res) => {
      const posIdString = res?.positionId?.toString();

      // find matched position to get hourly rate
      const position = availablePositions.find((p) => String(p.id) === posIdString);
      const rate = position?.hourlyRate || 0;
      const hours = Number(res?.estimatedHours) || 0;

      totalBaseCost += rate * hours;
      totalHours += hours;
    });

    const marginPercent = Number(watchedMargin) || 0;
    const calculatedPrice = totalBaseCost + totalBaseCost * (marginPercent / 100);
    const profit = calculatedPrice - totalBaseCost;

    return { totalHours, totalBaseCost, calculatedPrice, profit };
  }, [watchedResources, watchedMargin, availablePositions]);

  const onSubmit: SubmitHandler<ServiceFormValues> = async (rawVal) => {
    setIsPending(true);

    try {
      let result;

      // check against initial data id to decide between update or create action
      if (initialData?.id) {
        // update existing template
        const updatePayload = {
          ...rawVal,
          id: initialData.id
        } as unknown as UpdateServiceTemplateInput;

        result = await updateServiceTemplate(updatePayload);
      } else {
        // create new template
        const createPayload = rawVal as unknown as CreateServiceTemplateInput;
        result = await createServiceTemplate(createPayload);
      }

      if (result.ok) {
        toast.success(result.message);
        onSuccess();
      } else {
        toast.error(result.error || 'Wystąpił błąd zapisu');
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([key, messages]) => {
            if (messages && messages.length > 0) {
              form.setError(key as keyof ServiceFormValues, { message: messages[0] });
            }
          });
        }
      }
    } catch (error) {
      console.error(error);
      toast.error('Wystąpił nieoczekiwany błąd');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 text-white">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-300">Nazwa Szablonu Usługi</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ''}
                    className="bg-[#0B1121] border-slate-700 text-white placeholder:text-slate-600"
                    placeholder="np. Sklep Internetowy MVP"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-300">Status Szablonu</FormLabel>
                <FormControl>
                  <div className="flex items-center h-10 px-3 rounded-md border border-slate-700 bg-[#0B1121] transition-colors focus-within:ring-1 focus-within:ring-slate-300">
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-emerald-500 mr-3"
                    />
                    <span className={`text-sm font-medium ${field.value ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {field.value ? 'Aktywny (Widoczny w wycenach)' : 'Szkic (Ukryty)'}
                    </span>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator className="bg-slate-800" />

        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-medium text-slate-200">Zasoby potrzebne do realizacji</h3>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({
                label: '',
                positionId: null,
                estimatedHours: 0,
              })}
              className="border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all text-xs"
            >
              <Plus className="w-3 h-3 mr-1" /> Dodaj zasób
            </Button>
          </div>

          <div className="grid grid-cols-[1.5fr_1fr_100px_100px_40px] gap-4 px-2 text-xs font-medium text-slate-500 uppercase">
            <div>Nazwa Zadania (Label)</div>
            <div>Stanowisko</div>
            <div>Czas (h)</div>
            <div className="text-right">Koszt est.</div>
            <div></div>
          </div>

          <div className="space-y-2">
            {fields.map((field, index) => {
              const currentPosId = form.getValues(`resources.${index}.positionId`);
              const currentPos = availablePositions.find((p) => String(p.id) === String(currentPosId));
              const currentHours = form.getValues(`resources.${index}.estimatedHours`);
              const rowCost = (currentPos?.hourlyRate || 0) * (Number(currentHours) || 0);

              return (
                <div
                  key={field.id}
                  className="grid grid-cols-[1.5fr_1fr_100px_100px_40px] gap-4 items-start"
                >
                  <FormField
                    control={form.control}
                    name={`resources.${index}.label`}
                    render={({ field }) => (
                      <FormItem className="space-y-0">
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value ?? ''}
                            placeholder="np. Konfiguracja serwera"
                            className="h-9 bg-[#0B1121] border-slate-700 text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`resources.${index}.positionId`}
                    render={({ field }) => (
                      <FormItem className="space-y-0">
                        <Select
                          onValueChange={field.onChange}
                          value={field.value ? String(field.value) : undefined}
                        >
                          <FormControl>
                            <SelectTrigger className="h-9 bg-[#0B1121] border-slate-700 text-white">
                              <SelectValue placeholder="Wybierz..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-[#0B1121] border-slate-800 text-white">
                            {availablePositions.map((pos) => (
                              <SelectItem key={pos.id} value={String(pos.id)}>
                                {pos.name} ({pos.hourlyRate} zł)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`resources.${index}.estimatedHours`}
                    render={({ field }) => (
                      <FormItem className="space-y-0">
                        <FormControl>
                          <NumberInput
                            value={field.value}
                            onChange={field.onChange}
                            min={0}
                            step={0.5}
                            // override default number input styles for right alignment and background
                            className="[&_input]:text-right [&_input]:bg-[#0B1121] [&_input]:border-slate-700"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center justify-end h-9 px-3 bg-slate-900/50 rounded border border-slate-800 text-slate-400 font-mono text-xs">
                    {rowCost.toFixed(0)} zł
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    className="h-9 w-9 text-slate-500 hover:text-red-400 hover:bg-slate-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/50 shadow-inner mt-8">
          <div className="bg-slate-900 px-5 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-emerald-500/10 rounded">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <h3 className="text-sm font-semibold text-slate-200 tracking-wide uppercase">
                Kalkulacja Szablonu
              </h3>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 relative">
            <div className="hidden md:block absolute top-6 bottom-6 left-1/2 w-px bg-slate-800"></div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Label className="text-slate-400 text-xs uppercase tracking-wider">
                  Suma Godzin
                </Label>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-light text-white font-mono">
                    {summary.totalHours}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">h</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-400 text-xs uppercase tracking-wider">
                  Koszt Wytworzenia (Internal)
                </Label>
                <div className="p-3 bg-[#0B1121] rounded-lg border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-500 text-xs">Stawki pracownicze</span>
                  <div className="font-mono text-slate-300 font-medium text-lg">
                    {summary.totalBaseCost.toLocaleString('pl-PL', { maximumFractionDigits: 0 })} zł
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6 md:pl-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-emerald-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                    Domyślna Marża
                  </Label>
                </div>
                <FormField
                  control={form.control}
                  name="defaultMargin"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative group">
                          {/* percent icon absolutely positioned */}
                          <div className="absolute inset-y-0 left-0 bg-emerald-500/10 w-12 flex items-center justify-center rounded-l-md border-r border-emerald-500/20 z-10 pointer-events-none">
                            <span className="text-emerald-500 font-bold font-mono">%</span>
                          </div>

                          {/* override number input styles to fit the design with absolute icon */}
                          <NumberInput
                            value={field.value}
                            onChange={field.onChange}
                            min={0}
                            max={100}
                            className="h-12 font-mono font-medium text-xl [&_input]:h-12 [&_input]:pl-14 [&_input]:bg-[#0B1121] [&_input]:border-slate-700"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator className="bg-slate-800" />

              <div className="flex flex-col items-end gap-1">
                <span className="text-xs text-slate-400 uppercase tracking-widest">
                  Estymowana cena (Netto)
                </span>

                <div className="text-4xl sm:text-5xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-slate-400 tracking-tighter drop-shadow-2xl">
                  {summary.calculatedPrice.toLocaleString('pl-PL', { maximumFractionDigits: 0 })}
                  <span className="text-lg text-slate-600 ml-3 font-sans font-normal">PLN</span>
                </div>

                <div className="mt-2 inline-flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-medium text-emerald-400 uppercase font-mono tracking-wide">
                    ZYSK: +{summary.profit.toLocaleString('pl-PL', { maximumFractionDigits: 0 })}{' '}
                    PLN
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <Label className="text-slate-300">Opis (Opcjonalnie)</Label>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value || ''}
                  className="min-h-[100px] bg-[#0B1121] border-slate-700 text-white placeholder:text-slate-600"
                  placeholder="Krótki opis co wchodzi w skład tego szablonu..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-4 flex justify-end">
          <Button
            type="submit"
            disabled={isPending}
            className="w-full md:w-auto md:min-w-[200px] bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Zapisywanie...
              </>
            ) : initialData ? (
              'Zapisz zmiany'
            ) : (
              'Utwórz szablon'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}