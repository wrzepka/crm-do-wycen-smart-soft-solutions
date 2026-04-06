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
import {
  Plus,
  Trash2,
  Calculator,
  Loader2,
  TrendingUp,
  AlertCircle,
  Coins,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  createServiceTemplateWithResourcesSchema,
  updateServiceTemplateWithResourcesSchema,
} from '@/lib/schemas/serviceSchema';

import { createServiceTemplate, updateServiceTemplate } from '@/lib/actions/service-actions';

import { CreateServiceTemplateInput, UpdateServiceTemplateInput } from '@/types/services';
import { cn } from '@/lib/utils';

export interface PositionOption {
  id: number;
  name: string;
  cost: number;
  rate: number;
}

export type ServiceFormValues = Omit<
  z.input<typeof updateServiceTemplateWithResourcesSchema>,
  'id'
> & {
  id?: string | null;
};

interface ServiceFormProps {
  initialData?: Partial<ServiceFormValues>;
  availablePositions: PositionOption[];
  onSuccess: () => void;
}

export function ServiceForm({ initialData, availablePositions, onSuccess }: ServiceFormProps) {
  const [isPending, setIsPending] = useState(false);
  const isEditMode = !!initialData?.id;

  const schema = isEditMode
    ? updateServiceTemplateWithResourcesSchema
    : createServiceTemplateWithResourcesSchema;

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      id: initialData?.id,
      name: initialData?.name || '',
      description: initialData?.description || '',
      isActive: initialData?.isActive ?? true,
      resources: initialData?.resources || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'resources',
  });

  const watchedResources = useWatch({ control: form.control, name: 'resources' });

  const summary = useMemo(() => {
    let totalCost = 0;
    let totalNetPrice = 0;
    let totalQuantity = 0;

    watchedResources?.forEach((res) => {
      const posIdString = res?.positionId?.toString();
      const quantity = Number(res?.estimated_quantity) || 0;

      const position = availablePositions.find((p) => String(p.id) === posIdString);

      const cost = position?.cost || 0;
      const price =
        res?.price_override !== null &&
        res?.price_override !== undefined &&
        res?.price_override !== ''
          ? Number(res.price_override)
          : position?.rate || 0;

      totalCost += cost * quantity;
      totalNetPrice += price * quantity;
      totalQuantity += quantity;
    });

    const profit = totalNetPrice - totalCost;
    const marginPercent = totalNetPrice > 0 ? (profit / totalNetPrice) * 100 : 0;

    return { totalQuantity, totalCost, totalNetPrice, profit, marginPercent };
  }, [watchedResources, availablePositions]);

  const onSubmit: SubmitHandler<ServiceFormValues> = async (rawVal) => {
    setIsPending(true);
    try {
      let result;
      if (initialData?.id) {
        result = await updateServiceTemplate({
          ...rawVal,
          id: initialData.id,
        } as UpdateServiceTemplateInput);
      } else {
        result = await createServiceTemplate(rawVal as CreateServiceTemplateInput);
      }

      if (result.ok) {
        toast.success(result.message);
        onSuccess();
      } else {
        toast.error(result.error || 'Wystąpił błąd zapisu');
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
                    <span
                      className={`text-sm font-medium ${field.value ? 'text-emerald-400' : 'text-slate-500'}`}
                    >
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-blue-500/10 p-2 rounded-lg">
                <Calculator className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-200">Zasoby i Kosztorys</h3>
                <p className="text-xs text-slate-500">
                  Dodaj składniki usługi, aby wyliczyć marżę.
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({
                  label: '',
                  positionId: null,
                  estimated_quantity: 0,
                  unit: 'h',
                  price_override: null,
                })
              }
              className="border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all text-xs"
            >
              <Plus className="w-3 h-3 mr-1" /> Dodaj pozycję
            </Button>
          </div>

          <div className="space-y-3">
            {fields.map((field, index) => {
              const currentPosId = form.getValues(`resources.${index}.positionId`);
              const currentPos = availablePositions.find(
                (p) => String(p.id) === String(currentPosId),
              );
              const qty = Number(form.getValues(`resources.${index}.estimated_quantity`) || 0);

              const currentOverride = form.getValues(`resources.${index}.price_override`);
              const unitCost = currentPos?.cost || 0;

              const unitPrice =
                currentOverride !== null && currentOverride !== undefined && currentOverride !== ''
                  ? Number(currentOverride)
                  : currentPos?.rate || 0;

              const rowCost = unitCost * qty;
              const rowPrice = unitPrice * qty;
              const rowProfit = rowPrice - rowCost;

              return (
                <div
                  key={field.id}
                  className="bg-[#0B1121] border border-slate-800/60 rounded-xl p-4 transition-all hover:border-slate-700"
                >
                  <div className="grid grid-cols-2 md:grid-cols-[2fr_2fr_1fr_1fr_40px] gap-4 items-start mb-4">
                    <FormField
                      control={form.control}
                      name={`resources.${index}.label`}
                      render={({ field }) => (
                        <FormItem className="space-y-1 col-span-2 md:col-span-1">
                          <FormLabel className="text-[10px] uppercase text-slate-500 font-semibold tracking-wider">
                            Nazwa Zadania
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value ?? ''}
                              placeholder="np. Konfiguracja"
                              className="bg-slate-900/50 border-slate-700 focus:border-blue-500 text-white text-sm"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`resources.${index}.positionId`}
                      render={({ field }) => (
                        <FormItem className="space-y-1 col-span-2 md:col-span-1">
                          <FormLabel className="text-[10px] uppercase text-slate-500 font-semibold tracking-wider">
                            Stanowisko
                          </FormLabel>
                          <Select
                            onValueChange={(val) => {
                              field.onChange(val);
                              form.setValue(`resources.${index}.price_override`, null);
                            }}
                            value={field.value ? String(field.value) : undefined}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white text-sm h-auto py-6">
                                <SelectValue placeholder="Wybierz..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-[#0B1121] border-slate-800 text-white max-h-[300px]">
                              {availablePositions.map((pos) => (
                                <SelectItem
                                  key={pos.id}
                                  value={String(pos.id)}
                                  className="text-xs py-1 px-2 border-b border-slate-800/50 last:border-0 cursor-pointer focus:bg-slate-800"
                                >
                                  <div className="flex flex-col gap-0.5">
                                    <span className="font-medium text-slate-200 text-sm">
                                      {pos.name}
                                    </span>
                                    <div className="flex gap-3 text-[10px] opacity-80">
                                      <span className="text-rose-400">Koszt: {pos.cost} zł</span>
                                      <span className="text-emerald-400">Cena: {pos.rate} zł</span>
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`resources.${index}.estimated_quantity`}
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-[10px] uppercase text-slate-500 font-semibold tracking-wider">
                            Ilość (h)
                          </FormLabel>
                          <FormControl>
                            <NumberInput
                              value={(field.value as number | undefined) ?? ''}
                              onChange={field.onChange}
                              min={0}
                              step={0.5}
                              className="[&_input]:text-right bg-slate-900/50 border-slate-700 focus:border-blue-500 text-white text-sm"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`resources.${index}.price_override`}
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <div className="flex items-center justify-between">
                            <FormLabel
                              className="text-[10px] uppercase text-slate-500 font-semibold tracking-wider"
                              title="Domyślnie stawka ze stanowiska"
                            >
                              Cena/h
                            </FormLabel>
                            {field.value !== null &&
                              field.value !== undefined &&
                              field.value !== '' && (
                                <span className="text-[9px] text-amber-500 font-mono font-bold">
                                  Custom
                                </span>
                              )}
                          </div>
                          <FormControl>
                            <NumberInput
                              value={
                                (field.value as number | undefined) ??
                                (currentPos ? currentPos.rate : '') ??
                                ''
                              }
                              onChange={field.onChange}
                              min={0}
                              step={1}
                              className={cn(
                                '[&_input]:text-right bg-slate-900/50 border-slate-700 focus:border-blue-500 text-white text-sm',
                                field.value !== null &&
                                  field.value !== undefined &&
                                  field.value !== ''
                                  ? 'border-amber-500/50 text-amber-400 focus:border-amber-500'
                                  : 'text-slate-400',
                              )}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="pt-7 flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        className="h-9 w-9 text-slate-500 hover:text-red-400 hover:bg-rose-950/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-6 pt-3 border-t border-slate-800/50">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase text-slate-500 font-medium">
                        Koszt (Firma):
                      </span>
                      <span className="font-mono text-sm text-slate-400 font-medium">
                        {rowCost.toFixed(0)} zł
                      </span>
                    </div>

                    <div className="h-4 w-px bg-slate-800 hidden sm:block"></div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase text-slate-500 font-medium">
                        Wycena (Klient):
                      </span>
                      <span className="font-mono text-sm text-slate-400 font-medium">
                        {rowPrice.toFixed(0)} zł
                      </span>
                    </div>

                    <ArrowRight className="w-4 h-4 text-slate-700 hidden sm:block" />

                    <div
                      className={cn(
                        'flex items-center gap-2 px-3 py-1.5 rounded-md border shadow-sm ml-2',
                        rowProfit >= 0
                          ? 'bg-emerald-950/20 border-emerald-500/20'
                          : 'bg-rose-950/20 border-rose-500/20',
                      )}
                    >
                      <div className="flex flex-col items-end leading-none">
                        <span
                          className={cn(
                            'text-[10px] font-bold uppercase tracking-wider mb-0.5',
                            rowProfit >= 0 ? 'text-emerald-500' : 'text-rose-500',
                          )}
                        >
                          Zysk
                        </span>
                        <span
                          className={cn(
                            'font-mono text-sm font-bold',
                            rowProfit >= 0 ? 'text-emerald-400' : 'text-rose-400',
                          )}
                        >
                          {rowProfit > 0 ? '+' : ''}
                          {rowProfit.toFixed(0)} zł
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {fields.length === 0 && (
            <div className="text-center py-8 border border-dashed border-slate-800 rounded-xl bg-slate-900/20">
              <Coins className="w-10 h-10 text-slate-700 mx-auto mb-2 opacity-50" />
              <p className="text-slate-500 text-sm">Brak pozycji w kosztorysie.</p>
              <Button
                type="button"
                variant="link"
                onClick={() =>
                  append({
                    label: '',
                    positionId: null,
                    estimated_quantity: 0,
                    unit: 'h',
                    price_override: null,
                  })
                }
                className="text-blue-400"
              >
                Dodaj pierwszą pozycję
              </Button>
            </div>
          )}
        </div>

        <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/50 shadow-inner mt-8">
          <div className="bg-slate-900 px-5 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-emerald-500/10 rounded">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <h3 className="text-sm font-semibold text-slate-200 tracking-wide uppercase">
                Symulacja Finansowa Całości
              </h3>
            </div>
            {summary.profit < 0 && (
              <div className="flex items-center gap-1 text-rose-400 text-xs font-medium bg-rose-500/10 px-2 py-1 rounded">
                <AlertCircle size={12} /> Ujemna marża
              </div>
            )}
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 relative">
            <div className="hidden md:block absolute top-6 bottom-6 left-1/2 w-px bg-slate-800"></div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Label className="text-slate-400 text-xs uppercase tracking-wider">
                  Suma Zasobów
                </Label>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-light text-white font-mono">
                    {summary.totalQuantity}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">jednostek</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-400 text-xs uppercase tracking-wider">
                  Całkowity Koszt (Internal)
                </Label>
                <div className="p-3 bg-[#0B1121] rounded-lg border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-500 text-xs">Wypłaty pracowników</span>
                  <div className="font-mono text-slate-300 font-medium text-lg">
                    {summary.totalCost.toLocaleString('pl-PL', { maximumFractionDigits: 0 })} zł
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6 md:pl-4 flex flex-col justify-between h-full">
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs text-slate-400 uppercase tracking-widest">
                  Wartość Oferty (Netto)
                </span>
                <div className="text-4xl sm:text-5xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-slate-400 tracking-tighter drop-shadow-2xl">
                  {summary.totalNetPrice.toLocaleString('pl-PL', { maximumFractionDigits: 0 })}
                  <span className="text-lg text-slate-600 ml-3 font-sans font-normal">PLN</span>
                </div>
              </div>

              <div className="flex flex-col items-end">
                <Separator className="bg-slate-800 mb-4 w-full" />
                <div
                  className={cn(
                    'inline-flex items-center gap-2 px-4 py-2 rounded-lg border backdrop-blur-sm transition-colors',
                    summary.profit >= 0
                      ? 'bg-emerald-500/10 border-emerald-500/20'
                      : 'bg-rose-500/10 border-rose-500/20',
                  )}
                >
                  <span
                    className={cn(
                      'w-2 h-2 rounded-full animate-pulse',
                      summary.profit >= 0 ? 'bg-emerald-500' : 'bg-rose-500',
                    )}
                  ></span>
                  <div className="flex flex-col items-end">
                    <span
                      className={cn(
                        'text-xs font-medium uppercase font-mono tracking-wide',
                        summary.profit >= 0 ? 'text-emerald-400' : 'text-rose-400',
                      )}
                    >
                      {summary.profit >= 0 ? 'Prognozowany Zysk' : 'Prognozowana Strata'}
                    </span>
                    <span
                      className={cn(
                        'text-lg font-bold font-mono leading-none',
                        summary.profit >= 0 ? 'text-emerald-300' : 'text-rose-300',
                      )}
                    >
                      {summary.profit > 0 ? '+' : ''}
                      {summary.profit.toLocaleString('pl-PL', { maximumFractionDigits: 0 })} PLN
                      <span className="text-xs ml-1 opacity-70">
                        ({summary.marginPercent.toFixed(1)}%)
                      </span>
                    </span>
                  </div>
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
