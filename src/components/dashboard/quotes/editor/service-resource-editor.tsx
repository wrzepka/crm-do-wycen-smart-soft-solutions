'use client';

import { useFieldArray, useFormContext } from 'react-hook-form';
import { Plus, Trash2, GripVertical } from 'lucide-react';
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
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { QuoteFormValues } from './quote-editor';
import { cn } from '@/lib/utils';

interface ServiceResourceEditorProps {
    nestIndex: number;
    positions: any[];
}

export function ServiceResourceEditor({ nestIndex, positions }: ServiceResourceEditorProps) {
    const { control, watch, setValue } = useFormContext<QuoteFormValues>();

    const { fields, append, remove } = useFieldArray({
        control,
        name: `services.${nestIndex}.resources`,
    });

    // Obserwujemy całą tablicę zasobów dla tej usługi, aby przeliczać sumy w czasie rzeczywistym
    const resources = watch(`services.${nestIndex}.resources`);

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
        <div className="space-y-3">
            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50">
                            <TableHead className="w-[30px]"></TableHead>
                            <TableHead className="w-[200px]">Stanowisko (Opcjonalnie)</TableHead>
                            <TableHead className="min-w-[200px]">Nazwa pozycji / Czynność</TableHead>
                            <TableHead className="w-[100px]">Ilość</TableHead>
                            <TableHead className="w-[80px]">Jedn.</TableHead>
                            <TableHead className="w-[120px] text-right">Cena jedn.</TableHead>
                            <TableHead className="w-[120px] text-right">Suma (Netto)</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {fields.map((item, k) => {
                            const currentResource = resources?.[k] || item;
                            const qty = Number(currentResource.quantity) || 0;
                            const price = Number(currentResource.unit_price) || 0;
                            const total = (qty * price).toFixed(2);

                            return (
                                <TableRow key={item.id}>
                                    {/* Uchwyt */}
                                    <TableCell>
                                        <GripVertical className="h-4 w-4 text-slate-300 cursor-move" />
                                    </TableCell>

                                    {/* Wybór Stanowiska - Automatyczne uzupełnianie */}
                                    <TableCell>
                                        <FormField
                                            control={control}
                                            name={`services.${nestIndex}.resources.${k}.positionId`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <Select
                                                        value={field.value ? String(field.value) : undefined}
                                                        onValueChange={(val) => {
                                                            field.onChange(Number(val));
                                                            const pos = positions.find(p => p.id === Number(val));
                                                            if (pos) {
                                                                setValue(`services.${nestIndex}.resources.${k}.unit_price`, Number(pos.rate));
                                                                setValue(`services.${nestIndex}.resources.${k}.unit_cost`, Number(pos.cost));
                                                                const currentLabel = resources?.[k]?.label;
                                                                if (!currentLabel) {
                                                                    setValue(`services.${nestIndex}.resources.${k}.label`, pos.name);
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger className="h-8 text-xs bg-slate-50">
                                                                <SelectValue placeholder="Wybierz..." />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {positions.map(p => (
                                                                <SelectItem key={p.id} value={String(p.id)} className="text-xs">
                                                                    {p.name} ({p.rate} zł)
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )}
                                        />
                                    </TableCell>

                                    {/* Nazwa / Label */}
                                    <TableCell>
                                        <FormField
                                            control={control}
                                            name={`services.${nestIndex}.resources.${k}.label`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input {...field} value={field.value ?? ''} placeholder="Opis pozycji..." className="h-8 bg-transparent" />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </TableCell>

                                    {/* Ilość */}
                                    <TableCell>
                                        <FormField
                                            control={control}
                                            name={`services.${nestIndex}.resources.${k}.quantity`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            min={0}
                                                            step={0.5}
                                                            className="h-8 text-right font-medium"
                                                            {...field}
                                                            // NAPRAWA BŁĘDU: Obsługa null/undefined w value i onChange
                                                            value={field.value ?? ''}
                                                            onChange={e => {
                                                                const val = e.target.valueAsNumber;
                                                                field.onChange(isNaN(val) ? 0 : val);
                                                            }}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </TableCell>

                                    {/* Jednostka */}
                                    <TableCell>
                                        <FormField
                                            control={control}
                                            name={`services.${nestIndex}.resources.${k}.unit`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input {...field} value={field.value ?? ''} className="h-8 text-center text-xs text-slate-500" />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </TableCell>

                                    {/* Cena Jednostkowa */}
                                    <TableCell>
                                        <FormField
                                            control={control}
                                            name={`services.${nestIndex}.resources.${k}.unit_price`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            min={0}
                                                            step={1}
                                                            className="h-8 text-right text-amber-600 font-semibold border-amber-100 focus:border-amber-400"
                                                            {...field}
                                                            // NAPRAWA BŁĘDU: Obsługa null/undefined w value i onChange
                                                            value={field.value ?? ''}
                                                            onChange={e => {
                                                                const val = e.target.valueAsNumber;
                                                                field.onChange(isNaN(val) ? 0 : val);
                                                            }}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </TableCell>

                                    {/* Suma (Read Only) */}
                                    <TableCell className="text-right font-bold text-slate-700">
                                        {total} zł
                                    </TableCell>

                                    {/* Usuń */}
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-slate-400 hover:text-red-600"
                                            onClick={() => remove(k)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}

                        {fields.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center text-sm text-slate-400 py-4">
                                    Brak pozycji. Kliknij "Dodaj pozycję" poniżej.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addResource}
                className="border-dashed text-slate-600 hover:text-blue-600 hover:border-blue-300"
            >
                <Plus className="mr-2 h-4 w-4" /> Dodaj pozycję
            </Button>
        </div>
    );
}