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
import { PositionForm } from './position-form';
import { positions } from '@/generated/prisma/client';

interface PositionSheetProps {
  position?: positions;
  children?: React.ReactNode;
}

export function PositionSheet({ position, children }: PositionSheetProps) {
  const [open, setOpen] = useState(false);
  const isEdit = !!position;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children ? (
          children
        ) : (
          <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
            <Plus size={18} />
            Dodaj stanowisko
          </Button>
        )}
      </SheetTrigger>

      <SheetContent className="bg-[#0B1121] border-l border-slate-800 text-white sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-white text-xl font-bold">
            {isEdit ? 'Edytuj stanowisko' : 'Nowe stanowisko'}
          </SheetTitle>
          <SheetDescription className="text-slate-400">
            {isEdit
              ? 'Zmień nazwę stanowiska.'
              : 'Dodaj nowe stanowisko do listy dostępnych w firmie.'}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-8">
          <PositionForm initialData={position} onSuccess={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
