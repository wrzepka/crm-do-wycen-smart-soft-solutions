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
import { ClientWithRelations } from '@/types/client';
import { ClientForm } from './client-form';

interface ClientSheetProps {
  client?: ClientWithRelations;
  children: React.ReactNode;
}

export function ClientSheet({ client, children }: ClientSheetProps) {
  const [open, setOpen] = useState(false);
  const isEdit = !!client;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>

      <SheetContent className="bg-[#0B1121] border-l border-slate-800 text-white sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-white text-xl font-bold">
            {isEdit ? 'Edytuj klienta' : 'Nowy klient'}
          </SheetTitle>
          <SheetDescription className="text-slate-400">
            {isEdit
              ? 'Zaktualizuj dane klienta lub leada.'
              : 'Wprowadź dane, aby dodać nową firmę do bazy.'}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-8">
          <ClientForm initialData={client} onSuccess={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
