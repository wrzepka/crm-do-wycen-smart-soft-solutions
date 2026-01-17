'use client';

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
// import position type from service form
import { ServiceForm, ServiceFormValues, PositionOption } from './service-form';
import { ServiceTemplateDTO } from './service-list-table';

interface ServiceSheetProps {
  serviceToEdit?: ServiceTemplateDTO | null;
  positions: PositionOption[]; // added: list of positions needed for the form
  children?: React.ReactNode;
}

// map data from table dto to form values
function mapServiceToForm(service: ServiceTemplateDTO): Partial<ServiceFormValues> {
  return {
    id: service.id, // crucial: missing id caused create instead of update
    name: service.name,
    description: service.description || '',
    defaultMargin: service.defaultMargin,
    isActive: service.isActive,
    resources: service.resources?.map((res) => ({
      label: res.label || 'Zasób',
      // convert to string as select component operates on strings
      positionId: res.positionId ? String(res.positionId) : null,
      estimatedHours: Number(res.estimatedHours || 0),
    })) || [],
  };
}

export function ServiceSheet({ serviceToEdit, positions, children }: ServiceSheetProps) {
  const [open, setOpen] = useState(false);
  const isEditMode = !!serviceToEdit;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children ? (
          children
        ) : (
          <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2 cursor-pointer shadow-sm">
            <Plus size={18} />
            Dodaj usługę
          </Button>
        )}
      </SheetTrigger>

      <SheetContent className="bg-[#0B1121] border-l border-slate-800 text-white sm:max-w-2xl w-full flex flex-col h-full overflow-y-auto">
        <SheetHeader className="flex-shrink-0 mb-6">
          <SheetTitle className="text-white text-xl font-bold">
            {isEditMode ? 'Edytuj usługę' : 'Nowa usługa'}
          </SheetTitle>
          <SheetDescription className="text-slate-400">
            {isEditMode
              ? 'Zmodyfikuj parametry szablonu.'
              : 'Zdefiniuj nowy szablon usługi w systemie.'}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 pb-10">
          <ServiceForm
            initialData={serviceToEdit ? mapServiceToForm(serviceToEdit) : undefined}
            availablePositions={positions}
            onSuccess={() => setOpen(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}