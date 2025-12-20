'use client'; // Client Component needed for interactive Sheet state

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
import { TechnologyForm } from './technology-form';

interface TechnologySheetProps {
  technology?: { id: number; name: string };
  children?: React.ReactNode;
}

export function TechnologySheet({ technology, children }: TechnologySheetProps) {
  const [open, setOpen] = useState(false);
  const isEdit = !!technology;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children ? (
          children
        ) : (
          <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
            <Plus size={18} />
            Dodaj technologię
          </Button>
        )}
      </SheetTrigger>

      <SheetContent className="bg-[#0B1121] border-l border-slate-800 text-white sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-white text-xl font-bold">
            {isEdit ? 'Edytuj technologię' : 'Nowa technologia'}
          </SheetTitle>
          <SheetDescription className="text-slate-400">
            {isEdit
              ? 'Zmień nazwę technologii.'
              : 'Dodaj nową technologię do listy dostępnych kompetencji.'}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-8">
          <TechnologyForm initialData={technology} onSuccess={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
