'use client';

import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
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
import { FormControl, FormField, FormItem } from '@/components/ui/form';
import { QuoteFormValues } from './quote-editor';

interface ServiceResourceEditorProps {
    nestIndex: number;
    positions: any[];
}

export function ServiceResourceEditor({ nestIndex, positions }: ServiceResourceEditorProps) {
    const { control, setValue } = useFormContext<QuoteFormValues>();

    const { fields, append, remove } = useFieldArray({
        control,
        name: `services.${nestIndex}.resources`,
    });

    // Używamy useWatch, aby mieć podgląd wartości live (do obliczeń w tabeli)
    // To jest wydajniejsze niż watch() całego formularza
    const resourcesWatcher = useWatch({
        control,
        name: `services.${nestIndex}.resources`,
    });

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
                            <TableHead className="w-[200px]">Stanowisko</TableHead>
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
                            // Pobieramy wartości live z watchera, a jeśli ich nie ma (np. przed pierwszym renderem), bierzemy z item
                            // resourcesWatcher może być undefined przy inicjalizacji
                            const watchedItem = resourcesWatcher?.[k];

                            const qty = Number(watchedItem?.quantity ?? item.quantity ?? 0);
                            const price = Number(watchedItem?.unit_price ?? item.unit_price ?? 0);
                            const total = (qty * price).toFixed(2);

                            return (
                                <TableRow key={item.id}>
                                    {/* Uchwyt */}
                                    <TableCell>
                                        <GripVertical className="h-4 w-4 text-slate-300 cursor-move" />
                                    </TableCell>

                                    {/* Wybór Stanowiska */}
                                    <TableCell>
                                        <FormField
                                            control={control}
                                            name={`services.${nestIndex}.resources.${k}.positionId`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <Select
                                                        value={field.value ? String(field.value) : undefined}
                                                        onValueChange={(val) => {
                                                            const numVal = Number(val);
                                                            field.onChange(numVal);
                                                            const pos = positions.find(p => p.id === numVal);
                                                            if (pos) {
                                                                setValue(`services.${nestIndex}.resources.${k}.unit_price`, Number(pos.rate));
                                                                setValue(`services.${nestIndex}.resources.${k}.unit_cost`, Number(pos.cost));

                                                                // Ustawiamy nazwę tylko jeśli jest pusta
                                                                const currentLabel = resourcesWatcher?.[k]?.label;
                                                                if (!currentLabel) {
                                                                    setValue(`services.${nestIndex}.resources.${k}.label`, pos.name);
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger className="h-8 text-xs bg-slate-50 border-slate-200">
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
                                                        <Input {...field} value={field.value || ''} placeholder="Opis..." className="h-8 bg-transparent" />
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
                                                            className="h-8 text-right font-medium"
                                                            placeholder="0"
                                                            {...field}
                                                            // Kluczowa poprawka: value musi być stringiem lub number, ale nie null
                                                            value={field.value ?? ''}
                                                            onChange={(e) => {
                                                                // Pozwalamy na pusty ciąg znaków podczas edycji
                                                                const val = e.target.value;
                                                                field.onChange(val === '' ? 0 : parseFloat(val));
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
                                                        <Input {...field} value={field.value || ''} className="h-8 text-center text-xs text-slate-500" />
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
                                                            className="h-8 text-right text-amber-600 font-semibold border-amber-100 focus:border-amber-400"
                                                            placeholder="0.00"
                                                            {...field}
                                                            value={field.value ?? ''}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                field.onChange(val === '' ? 0 : parseFloat(val));
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
                                            type="button" // Ważne: prevent submit
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