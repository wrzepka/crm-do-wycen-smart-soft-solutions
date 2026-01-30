'use client';

import { useFieldArray, useFormContext } from 'react-hook-form';
import { Plus, Trash2, Layers, ChevronDown, ChevronUp, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { QuoteFormValues } from './quote-editor';
import { ServiceResourceEditor } from './service-resource-editor';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

// Props z danymi do wyboru
interface QuoteServicesEditorProps {
    serviceTemplates: any[];
    positions: any[];
}

export function QuoteServicesEditor({ serviceTemplates, positions }: QuoteServicesEditorProps) {
    const { control } = useFormContext<QuoteFormValues>();

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'services',
    });

    // 1. Dodaje PUSTĄ usługę
    const addEmptyService = () => {
        append({
            name: 'Nowa usługa',
            description: '',
            pricingHistoryId: null,
            resources: [],
            subtotal_net: 0,
            total_net: 0,
            total_cost: 0,
            discount: 0
        });
    };

    // 2. Dodaje usługę Z SZABLONU
    const addFromTemplate = (templateId: string) => {
        const template = serviceTemplates.find(t => String(t.id) === templateId);
        if (!template) return;

        // Mapujemy zasoby z szablonu na format formularza
        const mappedResources = (template.resources || []).map((res: any) => {
            // Próbujemy znaleźć powiązane stanowisko, aby pobrać aktualne stawki
            const pos = positions.find(p => p.id === res.positionId);

            // Cena: Jeśli szablon ma override -> override. Jeśli nie -> stawka stanowiska.
            const price = res.price_override
                ? Number(res.price_override)
                : (pos?.rate ? Number(pos.rate) : 0);

            const cost = pos?.cost ? Number(pos.cost) : 0;

            return {
                label: res.label,
                // Ważne: rzutujemy na number lub null dla zgodności z typem QuoteFormValues
                positionId: res.positionId ? Number(res.positionId) : null,
                quantity: Number(res.estimated_quantity || 1),
                unit: res.unit || 'h',
                unit_price: price,
                unit_cost: cost
            };
        });

        append({
            name: template.name,
            description: template.description || '',
            pricingHistoryId: null,
            resources: mappedResources,
            subtotal_net: 0, // Przeliczy się przy zapisie/edycji
            total_net: 0,
            total_cost: 0,
            discount: 0
        });

        toast.success(`Dodano usługę z szablonu: ${template.name}`);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                    <Layers className="h-5 w-5 text-blue-600" />
                    Zakres Usług
                </h3>

                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    {/* DROPDOWN DO WYBORU SZABLONU */}
                    {serviceTemplates.length > 0 && (
                        <div className="w-full sm:w-[250px]">
                            <Select onValueChange={addFromTemplate}>
                                <SelectTrigger className="bg-white">
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <Download className="h-4 w-4" />
                                        <SelectValue placeholder="Wczytaj z szablonu..." />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    {serviceTemplates.map(t => (
                                        <SelectItem key={t.id} value={String(t.id)}>
                                            {t.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <Button onClick={addEmptyService} type="button" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap">
                        <Plus className="mr-2 h-4 w-4" /> Pusta usługa
                    </Button>
                </div>
            </div>

            <div className="space-y-4">
                {fields.map((field, index) => (
                    <ServiceCard
                        key={field.id}
                        index={index}
                        positions={positions} // <--- KLUCZOWA POPRAWKA: Przekazujemy positions niżej
                        onRemove={() => remove(index)}
                    />
                ))}

                {fields.length === 0 && (
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-12 text-center bg-slate-50/50">
                        <p className="text-slate-500 mb-4">Twoja oferta jest pusta.</p>
                        <div className="flex justify-center gap-4">
                            <Button onClick={addEmptyService} variant="outline">
                                Dodaj pustą usługę
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// --- KARTA USŁUGI ---
// Dodajemy 'positions' do propsów
function ServiceCard({ index, onRemove, positions }: { index: number; onRemove: () => void; positions: any[] }) {
    const [isOpen, setIsOpen] = useState(true);
    const { register, control, watch } = useFormContext<QuoteFormValues>();

    const serviceName = watch(`services.${index}.name`);
    // @ts-ignore
    const resourceCount = watch(`services.${index}.resources`)?.length || 0;

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <Card className="border-l-4 border-l-blue-600 shadow-sm">
                <CardHeader className="py-3 px-4 bg-slate-50/50 flex flex-row items-center justify-between space-y-0 rounded-t-xl">
                    <div className="flex items-center gap-3 flex-1">
                        <CollapsibleTrigger asChild>
                            <Button type="button" variant="ghost" size="sm" className="p-0 h-8 w-8 hover:bg-slate-200">
                                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                        </CollapsibleTrigger>

                        <div className="flex-1">
                            {isOpen ? (
                                <Input
                                    {...register(`services.${index}.name`)}
                                    className="font-medium bg-white h-8 max-w-md"
                                    placeholder="Nazwa usługi (np. Backend Development)"
                                />
                            ) : (
                                <span className="font-medium text-slate-800 ml-1">{serviceName || 'Bez nazwy'}</span>
                            )}
                        </div>

                        {!isOpen && (
                            <Badge variant="secondary" className="mr-2">
                                {resourceCount} poz.
                            </Badge>
                        )}
                    </div>

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-slate-400 hover:text-red-600 h-8 w-8"
                        onClick={onRemove}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </CardHeader>

                <CollapsibleContent>
                    <CardContent className="p-4 pt-6 space-y-6">
                        <FormField
                            control={control}
                            name={`services.${index}.description`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            value={field.value || ''}
                                            placeholder="Dodatkowy opis widoczny na ofercie (opcjonalnie)"
                                            className="resize-none min-h-[60px] text-sm"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="pl-2 border-l-2 border-slate-100">
                            {/* KLUCZOWA POPRAWKA: Przekazujemy positions do ServiceResourceEditor */}
                            <ServiceResourceEditor nestIndex={index} positions={positions} />
                        </div>
                    </CardContent>
                </CollapsibleContent>
            </Card>
        </Collapsible>
    );
}