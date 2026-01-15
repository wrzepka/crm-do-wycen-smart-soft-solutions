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
import { ServiceForm, ServiceFormValues } from './service-form';
import { ServiceMock } from './service-list-table';

interface ServiceSheetProps {
  serviceToEdit?: ServiceMock | null;
  children?: React.ReactNode;
}

function mapServiceToForm(service: ServiceMock): Partial<ServiceFormValues> {
  return {
    name: service.name,
    categoryId: service.categoryId,
    billingType: service.billingType,
    status: service.status,
    unit: service.unit,
    basePrice: service.basePrice,
    description: service.description,
    markup: 30,
    components: [],
  };
}

export function ServiceSheet({ serviceToEdit, children }: ServiceSheetProps) {
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

      <SheetContent className="bg-[#0B1121] border-l border-slate-800 text-white sm:max-w-2xl w-full flex flex-col h-full">
        <SheetHeader className="flex-shrink-0 mb-4">
          <SheetTitle className="text-white text-xl font-bold">
            {isEditMode ? 'Edytuj usługę' : 'Nowa usługa'}
          </SheetTitle>
          <SheetDescription className="text-slate-400">
            {isEditMode
              ? 'Zmodyfikuj parametry i cennik usługi.'
              : 'Zdefiniuj nową usługę lub produkt w katalogu.'}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto -mr-6 pr-6 pl-1 pb-6">
          <ServiceForm
            initialData={serviceToEdit ? mapServiceToForm(serviceToEdit) : undefined}
            onSuccess={() => setOpen(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
