'use client';

import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { Plus, Trash2, Layers, ChevronDown, ChevronUp, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
// [FIX] Importing DictionaryItem
import { QuoteFormValues, DictionaryItem } from './quote-editor';
import { ServiceResourceEditor } from './service-resource-editor';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { FormField, FormControl } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

// Helper types
interface PositionItem extends DictionaryItem {
  rate: number | string;
  cost: number | string;
}

interface TemplateResource {
  label: string;
  positionId: number | string | null;
  estimated_quantity: number | string;
  unit?: string;
  price_override?: number | string;
}

// Extending DictionaryItem to match generic type in quote-editor
interface ServiceTemplate extends DictionaryItem {
  description?: string;
  resources?: TemplateResource[];
}

interface QuoteServicesEditorProps {
  // [FIX] Accepting generic dictionary type to avoid parent conflicts
  serviceTemplates: DictionaryItem[];
  positions: DictionaryItem[];
}

export function QuoteServicesEditor({ serviceTemplates, positions }: QuoteServicesEditorProps) {
  const { control } = useFormContext<QuoteFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: 'services' });

  // [FIX] Safe casting inside component (avoids "Unexpected any")
  // TypeScript knows DictionaryItem is base, so casting via unknown is safe for linter
  const safeTemplates = serviceTemplates as unknown as ServiceTemplate[];
  const safePositions = positions as unknown as PositionItem[];

  const addEmptyService = () => {
    append({
      name: 'Nowa usługa',
      description: '',
      pricingHistoryId: null,
      resources: [],
      subtotal_net: 0,
      total_net: 0,
      total_cost: 0,
      discount: 0,
    });
  };

  const addFromTemplate = (templateId: string) => {
    const template = safeTemplates.find((t) => String(t.id) === templateId);
    if (!template) return;

    const mappedResources = (template.resources || []).map((res) => {
      const pos = safePositions.find((p) => String(p.id) === String(res.positionId));
      return {
        label: res.label,
        positionId: res.positionId ? Number(res.positionId) : null,
        quantity: Number(res.estimated_quantity || 1),
        unit: res.unit || 'h',
        unit_price: res.price_override
          ? Number(res.price_override)
          : pos?.rate
            ? Number(pos.rate)
            : 0,
        unit_cost: pos?.cost ? Number(pos.cost) : 0,
      };
    });

    append({
      name: template.name,
      description: template.description || '',
      pricingHistoryId: null,
      resources: mappedResources,
      subtotal_net: 0,
      total_net: 0,
      total_cost: 0,
      discount: 0,
    });
    toast.success('Zaimportowano szablon usługi');
  };

  return (
    <div className="space-y-6">
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row items-end justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Layers className="h-5 w-5 text-blue-600" />
            Zakres usług
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {safeTemplates.length > 0 && (
            <div className="w-[200px]">
              <Select onValueChange={addFromTemplate}>
                <SelectTrigger className="h-9 text-xs bg-white border-slate-300">
                  <SelectValue placeholder="Wczytaj szablon..." />
                </SelectTrigger>
                <SelectContent>
                  {safeTemplates.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)} className="text-xs">
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <Button
            onClick={addEmptyService}
            type="button"
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white h-9"
          >
            <Plus className="mr-2 h-3.5 w-3.5" /> Nowa usługa
          </Button>
        </div>
      </div>

      {/* SERVICE LIST */}
      <div className="space-y-4">
        {fields.map((field, index) => (
          <ServiceCard
            key={field.id}
            index={index}
            positions={safePositions}
            onRemove={() => remove(index)}
          />
        ))}

        {fields.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <div className="p-3 bg-white rounded-full shadow-sm mb-3">
              <Briefcase className="h-6 w-6 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">Kosztorys jest pusty</p>
            <p className="text-xs text-slate-400 mb-4">
              Dodaj pierwszą usługę, aby rozpocząć wycenę.
            </p>
            <Button
              onClick={addEmptyService}
              variant="outline"
              className="border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              Dodaj usługę
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function ServiceCard({
  index,
  onRemove,
  positions,
}: {
  index: number;
  onRemove: () => void;
  positions: PositionItem[];
}) {
  const [isOpen, setIsOpen] = useState(true);
  const { register, control } = useFormContext<QuoteFormValues>();
  const watchedService = useWatch({ control, name: `services.${index}` });

  // Header calculations
  const totalNet = Number(watchedService?.total_net || 0);
  const resourcesCount = watchedService?.resources?.length || 0;

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="group transition-all duration-200"
    >
      <Card
        className={`border shadow-sm transition-all ${isOpen ? 'border-blue-200 ring-1 ring-blue-50' : 'border-slate-200 hover:border-slate-300'}`}
      >
        {/* SERVICE HEADER */}
        <div className="flex items-center gap-4 p-4 bg-white rounded-t-xl">
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100 shrink-0"
            >
              {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </Button>
          </CollapsibleTrigger>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-center">
            <Input
              {...register(`services.${index}.name`)}
              className="text-lg font-bold border-transparent hover:border-slate-200 focus:border-blue-500 focus:ring-0 px-2 h-10 transition-colors bg-transparent placeholder:text-slate-300"
              placeholder="Nazwa usługi (np. Design System)"
            />

            {!isOpen && (
              <div className="flex items-center gap-4 text-sm animate-in fade-in slide-in-from-left-2 duration-300">
                <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-normal">
                  {resourcesCount} pozycji
                </Badge>
                <span className="font-bold text-slate-900 text-lg">{totalNet.toFixed(2)} PLN</span>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-300 hover:text-red-600 hover:bg-red-50 shrink-0 ml-2"
            onClick={onRemove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <CollapsibleContent>
          <div className="px-4 pb-4">
            {/* DESCRIPTION */}
            <div className="mb-4 pl-12 pr-4">
              <FormField
                control={control}
                name={`services.${index}.description`}
                render={({ field }) => (
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value || ''}
                      placeholder="Dodaj opis usługi widoczny na ofercie (opcjonalnie)..."
                      className="min-h-[40px] h-[40px] resize-none text-sm border-transparent bg-slate-50 focus:bg-white focus:border-blue-300 focus:h-[80px] transition-all duration-300 placeholder:text-slate-400"
                    />
                  </FormControl>
                )}
              />
            </div>

            {/* RESOURCE EDITOR (TABLE) */}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
              <ServiceResourceEditor nestIndex={index} positions={positions} />
            </div>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
