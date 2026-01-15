'use client';

import { useState, useMemo } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Calculator, Loader2, TrendingUp, Wallet } from 'lucide-react';
import { toast } from 'sonner';

type BillingType = 'TIME_MATERIAL' | 'FIXED_PRICE' | 'SUBSCRIPTION';
type ServiceStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';

export interface ServiceFormValues {
  name: string;
  categoryId: string;
  billingType: BillingType;
  status: ServiceStatus;
  unit: string;
  basePrice: number;
  markup: number;
  description: string;
  components: {
    positionId: string;
    hours: number;
  }[];
}

const MOCK_CATEGORIES = [
  { id: '1', name: 'Software Development' },
  { id: '2', name: 'UI/UX Design' },
  { id: '3', name: 'DevOps & Cloud' },
  { id: '4', name: 'Consulting' },
];

const MOCK_POSITIONS = [
  { id: '1', name: 'Senior Developer', hourlyRate: 150 },
  { id: '2', name: 'Mid Developer', hourlyRate: 100 },
  { id: '3', name: 'Junior Developer', hourlyRate: 60 },
  { id: '4', name: 'Project Manager', hourlyRate: 120 },
  { id: '5', name: 'UX/UI Designer', hourlyRate: 110 },
];

interface ServiceFormProps {
  initialData?: Partial<ServiceFormValues>;
  onSuccess: () => void;
}

export function ServiceForm({ initialData, onSuccess }: ServiceFormProps) {
  const [isPending, setIsPending] = useState(false);

  const form = useForm<ServiceFormValues>({
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      categoryId: initialData?.categoryId || '',
      billingType: initialData?.billingType || 'TIME_MATERIAL',
      status: initialData?.status || 'ACTIVE',
      unit: initialData?.unit || 'godz.',
      basePrice: initialData?.basePrice || 0,
      markup: initialData?.markup || 30,
      components: initialData?.components || [{ positionId: '', hours: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'components',
  });

  const watchedComponents = useWatch({ control: form.control, name: 'components' });
  const watchedMarkup = useWatch({ control: form.control, name: 'markup' });
  const watchedBillingType = useWatch({ control: form.control, name: 'billingType' });
  const watchedBasePrice = useWatch({ control: form.control, name: 'basePrice' });

  const summary = useMemo(() => {
    let totalBaseCost = 0;
    let totalHours = 0;

    if (watchedBillingType === 'TIME_MATERIAL') {
      watchedComponents?.forEach((comp) => {
        const position = MOCK_POSITIONS.find((p) => p.id === comp.positionId);
        const rate = position?.hourlyRate || 0;
        const hours = Number(comp.hours) || 0;

        totalBaseCost += rate * hours;
        totalHours += hours;
      });
    } else {
      totalBaseCost = Number(watchedBasePrice) || 0;
    }

    const markupPercent = Number(watchedMarkup) || 0;
    const calculatedPrice = totalBaseCost + totalBaseCost * (markupPercent / 100);
    const profit = calculatedPrice - totalBaseCost;

    return { totalHours, totalBaseCost, calculatedPrice, profit };
  }, [watchedComponents, watchedMarkup, watchedBasePrice, watchedBillingType]);

  const onSubmit = async (data: ServiceFormValues) => {
    setIsPending(true);

    console.log('=== DANE GOTOWE DLA BACKENDU ===');
    console.log('Payload:', {
      ...data,
      finalPriceSnapshot: summary.calculatedPrice,
    });

    setTimeout(() => {
      setIsPending(false);
      toast.success(initialData ? 'Usługa zaktualizowana (Mock)' : 'Usługa utworzona (Mock)');
      onSuccess();
    }, 1000);
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
                <FormLabel className="text-slate-300">Nazwa Usługi / Szablonu</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="bg-[#0B1121] border-slate-700 text-white placeholder:text-slate-600"
                    placeholder="np. Sklep MVP"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-300">Kategoria</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-[#0B1121] border-slate-700 text-white">
                      <SelectValue placeholder="Wybierz kategorię..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-[#0B1121] border-slate-800 text-white">
                    {MOCK_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="billingType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-300">Typ rozliczenia</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-[#0B1121] border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-[#0B1121] border-slate-800 text-white">
                    <SelectItem value="TIME_MATERIAL">Komponenty (T&M)</SelectItem>
                    <SelectItem value="FIXED_PRICE">Stała cena (Licencja)</SelectItem>
                    <SelectItem value="SUBSCRIPTION">Subskrypcja (Abo)</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-300">Jednostka</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="bg-[#0B1121] border-slate-700 text-white"
                    placeholder="np. godz., szt."
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-300">Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-[#0B1121] border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-[#0B1121] border-slate-800 text-white">
                    <SelectItem value="DRAFT">Szkic</SelectItem>
                    <SelectItem value="ACTIVE">Aktywna</SelectItem>
                    <SelectItem value="ARCHIVED">Zarchiwizowana</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>

        <Separator className="bg-slate-800" />

        {watchedBillingType === 'TIME_MATERIAL' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-medium text-slate-200">Koszty Zasobów</h3>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ positionId: '', hours: 0 })}
                className="border-slate-600 bg-transparent text-slate-300 hover:bg-slate-800 text-xs"
              >
                <Plus className="w-3 h-3 mr-1" /> Dodaj wiersz
              </Button>
            </div>

            <div className="grid grid-cols-[1fr_100px_100px_40px] gap-4 px-2 text-xs font-medium text-slate-500 uppercase">
              <div>Stanowisko</div>
              <div>Czas (h)</div>
              <div className="text-right">Koszt</div>
              <div></div>
            </div>

            <div className="space-y-2">
              {fields.map((field, index) => {
                const currentPosId = form.getValues(`components.${index}.positionId`);
                const currentPos = MOCK_POSITIONS.find((p) => p.id === currentPosId);
                const currentHours = form.getValues(`components.${index}.hours`);
                const rowCost = (currentPos?.hourlyRate || 0) * (Number(currentHours) || 0);

                return (
                  <div
                    key={field.id}
                    className="grid grid-cols-[1fr_100px_100px_40px] gap-4 items-start"
                  >
                    <FormField
                      control={form.control}
                      name={`components.${index}.positionId`}
                      render={({ field }) => (
                        <FormItem className="space-y-0">
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-9 bg-[#0B1121] border-slate-700 text-white">
                                <SelectValue placeholder="Wybierz..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-[#0B1121] border-slate-800 text-white">
                              {MOCK_POSITIONS.map((pos) => (
                                <SelectItem key={pos.id} value={pos.id}>
                                  {pos.name} ({pos.hourlyRate} zł)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`components.${index}.hours`}
                      render={({ field }) => (
                        <FormItem className="space-y-0">
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              step="0.5"
                              className="h-9 bg-[#0B1121] border-slate-700 text-white text-right"
                            />
                          </FormControl>
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
        ) : (
          <div className="p-5 border border-slate-800 bg-slate-900/30 rounded-lg space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-medium text-slate-200">Koszt zakupu / licencji</h3>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="basePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Cena Netto</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type="number"
                          className="bg-[#0B1121] border-slate-700 text-white pr-12 text-right font-mono font-bold text-lg"
                        />
                        <span className="absolute right-3 top-2.5 text-slate-500 text-sm">PLN</span>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/50 shadow-inner">
          <div className="bg-slate-900 px-5 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-emerald-500/10 rounded">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <h3 className="text-sm font-semibold text-slate-200 tracking-wide uppercase">
                Symulacja Ceny
              </h3>
            </div>
            {watchedBillingType !== 'TIME_MATERIAL' && (
              <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">
                Tryb ręczny
              </span>
            )}
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 relative">
            <div className="hidden md:block absolute top-6 bottom-6 left-1/2 w-px bg-slate-800"></div>

            <div
              className={`space-y-6 ${watchedBillingType !== 'TIME_MATERIAL' ? 'opacity-40 grayscale' : ''}`}
            >
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
                    Marża / Narzut
                  </Label>
                </div>
                <FormField
                  control={form.control}
                  name="markup"
                  render={({ field }) => (
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 bg-emerald-500/10 w-12 flex items-center justify-center rounded-l-md border-r border-emerald-500/20">
                        <span className="text-emerald-500 font-bold font-mono">%</span>
                      </div>
                      <Input
                        {...field}
                        type="number"
                        className="pl-14 bg-[#0B1121] border-slate-700 text-white font-mono font-medium focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500 text-xl h-12 transition-all"
                      />
                    </div>
                  )}
                />
              </div>

              <Separator className="bg-slate-800" />

              <div className="flex flex-col items-end gap-1">
                <span className="text-xs text-slate-400 uppercase tracking-widest">
                  Sugerowana cena (Netto)
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
              <Label className="text-slate-300">Opis (PDF)</Label>
              <FormControl>
                <Textarea
                  {...field}
                  className="min-h-[100px] bg-[#0B1121] border-slate-700 text-white placeholder:text-slate-600"
                />
              </FormControl>
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
              'Utwórz usługę'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
