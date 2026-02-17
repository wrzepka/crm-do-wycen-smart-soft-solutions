'use client';

import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { Plus, Trash2, GripVertical, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormField } from '@/components/ui/form';
import { QuoteFormValues } from './quote-editor';
import { useEffect } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PositionItem {
  id: number;
  name: string;
  rate: number | string;
  cost: number | string;
}

interface ServiceResourceEditorProps {
  nestIndex: number;
  positions: PositionItem[];
}

export function ServiceResourceEditor({ nestIndex, positions }: ServiceResourceEditorProps) {
  const { control, setValue } = useFormContext<QuoteFormValues>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: `services.${nestIndex}.resources`,
  });

  const resourcesWatcher = useWatch({
    control,
    name: `services.${nestIndex}.resources`,
  });

  // --- 1. SUMMATION LOGIC ---
  useEffect(() => {
    if (!resourcesWatcher) return;

    const serviceTotalNet = resourcesWatcher.reduce((acc, res) => {
      const qty = Number(res?.quantity || 0);
      const price = Number(res?.unit_price || 0);
      return acc + qty * price;
    }, 0);

    const serviceTotalCost = resourcesWatcher.reduce((acc, res) => {
      const qty = Number(res?.quantity || 0);
      const cost = Number(res?.unit_cost || 0);
      return acc + qty * cost;
    }, 0);

    setValue(`services.${nestIndex}.subtotal_net`, Number(serviceTotalNet.toFixed(2)), {
      shouldDirty: true,
    });
    setValue(`services.${nestIndex}.total_net`, Number(serviceTotalNet.toFixed(2)), {
      shouldDirty: true,
    });
    setValue(`services.${nestIndex}.total_cost`, Number(serviceTotalCost.toFixed(2)), {
      shouldDirty: true,
    });
  }, [resourcesWatcher, setValue, nestIndex]);

  // Calculate summary for view
  const summary = resourcesWatcher?.reduce(
    (acc, curr) => {
      const qty = Number(curr?.quantity || 0);
      return {
        cost: acc.cost + qty * Number(curr?.unit_cost || 0),
        price: acc.price + qty * Number(curr?.unit_price || 0),
        hours: acc.hours + (curr?.unit === 'godz.' || curr?.unit === 'h' ? qty : 0),
      };
    },
    { cost: 0, price: 0, hours: 0 },
  ) || { cost: 0, price: 0, hours: 0 };

  const margin = summary.price - summary.cost;
  const marginPercent = summary.price > 0 ? (margin / summary.price) * 100 : 0;

  const addResource = () => {
    append({
      label: '',
      unit: 'godz.',
      quantity: 1,
      unit_price: 0,
      unit_cost: 0,
      positionId: null,
    });
  };

  return (
    <div className="flex flex-col">
      {/* --- MAIN TABLE --- */}
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-b border-slate-200">
            <TableHead className="w-[30px] p-0"></TableHead>
            <TableHead className="w-[200px] text-xs font-semibold text-slate-500 uppercase tracking-tight">
              Stanowisko
            </TableHead>
            <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-tight">
              Nazwa zadania / Opis
            </TableHead>
            <TableHead className="w-[80px] text-xs font-semibold text-slate-500 uppercase tracking-tight text-center">
              Ilość
            </TableHead>
            <TableHead className="w-[120px] text-xs font-semibold text-slate-500 uppercase tracking-tight text-right">
              Stawka (PLN)
            </TableHead>
            <TableHead className="w-[120px] text-xs font-semibold text-slate-500 uppercase tracking-tight text-right">
              Wartość
            </TableHead>
            <TableHead className="w-[40px] p-0"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fields.map((item, k) => {
            const watchedItem = resourcesWatcher?.[k];
            const qty = Number(watchedItem?.quantity ?? item.quantity ?? 0);
            const price = Number(watchedItem?.unit_price ?? item.unit_price ?? 0);
            const cost = Number(watchedItem?.unit_cost ?? item.unit_cost ?? 0);

            const total = (qty * price).toFixed(2);
            // Alert if selling below cost (or very low margin < 10%)
            const isLowMargin = (price - cost) / price < 0.1 && price > 0;

            return (
              <TableRow
                key={item.id}
                className="group hover:bg-blue-50/30 border-b border-slate-100 last:border-0 transition-colors"
              >
                {/* Grip */}
                <TableCell className="py-1 px-0 text-center align-middle">
                  <GripVertical className="h-4 w-4 text-slate-300 mx-auto cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity" />
                </TableCell>

                {/* Position */}
                <TableCell className="py-1 px-2 align-top">
                  <FormField
                    control={control}
                    name={`services.${nestIndex}.resources.${k}.positionId`}
                    render={({ field }) => (
                      <div className="space-y-1 pt-1">
                        <Select
                          value={field.value ? String(field.value) : undefined}
                          onValueChange={(val) => {
                            const numVal = Number(val);
                            field.onChange(numVal);
                            const pos = positions.find((p) => p.id === numVal);
                            if (pos) {
                              setValue(
                                `services.${nestIndex}.resources.${k}.unit_price`,
                                Number(pos.rate),
                              );
                              setValue(
                                `services.${nestIndex}.resources.${k}.unit_cost`,
                                Number(pos.cost),
                              );
                              if (!resourcesWatcher?.[k]?.label) {
                                setValue(`services.${nestIndex}.resources.${k}.label`, pos.name);
                              }
                            }
                          }}
                        >
                          <SelectTrigger className="h-8 border-transparent bg-transparent hover:bg-white hover:border-slate-200 focus:ring-0 focus:border-blue-300 px-2 font-medium text-slate-700 shadow-none">
                            <SelectValue placeholder="Wybierz..." />
                          </SelectTrigger>
                          <SelectContent>
                            {positions.map((p) => (
                              <SelectItem key={p.id} value={String(p.id)}>
                                {p.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  />
                </TableCell>

                {/* Description */}
                <TableCell className="py-1 px-2 align-top">
                  <FormField
                    control={control}
                    name={`services.${nestIndex}.resources.${k}.label`}
                    render={({ field }) => (
                      <div className="pt-1">
                        <Input
                          {...field}
                          value={field.value || ''}
                          placeholder="Opis zadania..."
                          className="h-8 border-transparent bg-transparent hover:bg-white hover:border-slate-200 focus:bg-white focus:border-blue-300 px-2 shadow-none"
                        />
                      </div>
                    )}
                  />
                </TableCell>

                {/* Quantity */}
                <TableCell className="py-1 px-2 align-top">
                  <FormField
                    control={control}
                    name={`services.${nestIndex}.resources.${k}.quantity`}
                    render={({ field }) => (
                      <div className="pt-1">
                        <Input
                          type="number"
                          step="0.01"
                          className="h-8 text-center border-transparent bg-transparent hover:bg-white hover:border-slate-200 focus:bg-white focus:border-blue-300 px-1 shadow-none font-medium"
                          placeholder="0"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => {
                            const val = e.target.valueAsNumber;
                            field.onChange(isNaN(val) ? 0 : val);
                          }}
                        />
                        <div className="text-[10px] text-center text-slate-400 mt-0.5">godz.</div>
                      </div>
                    )}
                  />
                </TableCell>

                {/* Price */}
                <TableCell className="py-1 px-2 align-top">
                  <FormField
                    control={control}
                    name={`services.${nestIndex}.resources.${k}.unit_price`}
                    render={({ field }) => (
                      <div className="pt-1 relative">
                        <Input
                          type="number"
                          step="0.01"
                          className={`h-8 text-right border-transparent bg-transparent hover:bg-white hover:border-slate-200 focus:bg-white focus:border-blue-300 px-2 shadow-none font-medium ${isLowMargin ? 'text-amber-600' : ''}`}
                          placeholder="0.00"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => {
                            const val = e.target.valueAsNumber;
                            field.onChange(isNaN(val) ? 0 : val);
                          }}
                        />
                        {isLowMargin && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="absolute top-2 right-full mr-1 text-amber-500 cursor-help">
                                  <AlertCircle className="h-4 w-4" />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">Niska marża! Koszt: {cost} zł</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    )}
                  />
                </TableCell>

                {/* Total */}
                <TableCell className="py-1 px-2 text-right align-top pt-3">
                  <span className="font-bold text-slate-700">{total}</span>
                </TableCell>

                {/* Delete */}
                <TableCell className="py-1 px-0 text-center align-middle">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-slate-300 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => remove(k)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* --- ADD BUTTON + FINANCIAL SUMMARY (FOOTER) --- */}
      <div className="bg-slate-50 border-t border-slate-200 p-3 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left side: Adding */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addResource}
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs font-medium px-3"
        >
          <Plus className="mr-2 h-3.5 w-3.5" /> Dodaj wiersz
        </Button>

        {/* Right side: Service Summary */}
        {fields.length > 0 && (
          <div className="flex items-center gap-6 text-sm">
            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">
                Koszt
              </span>
              <span className="font-medium text-slate-600">{summary.cost.toFixed(2)} zł</span>
            </div>

            <div className="h-8 w-px bg-slate-200 rotate-12"></div>

            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">
                Marża
              </span>
              <div
                className={`flex items-center gap-1.5 font-bold ${margin >= 0 ? 'text-emerald-600' : 'text-red-600'}`}
              >
                <span>{margin.toFixed(2)} zł</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${margin >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}
                >
                  {marginPercent.toFixed(0)}%
                </span>
              </div>
            </div>

            <div className="h-8 w-px bg-slate-200 rotate-12"></div>

            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">
                Wycena (Netto)
              </span>
              <span className="font-bold text-lg text-slate-900">
                {summary.price.toFixed(2)} zł
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
