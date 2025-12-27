'use-client';

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
import { ClientDetails } from '@/components/dashboard/clients/client-details';

interface ClientSheetProps {
  client: ClientWithRelations;
  children: React.ReactNode;
}

// Simple data view. To change in future to handle edit, create
export function ClientSheet({ client, children }: ClientSheetProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>

      <SheetContent className="bg-[#0B1121] border-l border-slate-800 text-white sm:max-w-md pl-1">
        <SheetHeader>
          <SheetTitle className="text-white text-xl font-bold">
            {client.is_lead ? 'Szczegóły leada' : 'Szczegóły klienta'}
          </SheetTitle>
          <SheetDescription className="text-slate-400">
            Pełny podgląd informacji o {client.is_lead ? 'leadzie' : 'kliencie'} w systemie CRM.
          </SheetDescription>
        </SheetHeader>

        <ClientDetails client={client} />
      </SheetContent>
    </Sheet>
  );
}
