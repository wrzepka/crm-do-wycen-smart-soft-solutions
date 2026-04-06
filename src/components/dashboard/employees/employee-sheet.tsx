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
import { EmployeeForm } from './employee-form';
import { SafeEmployee } from '@/types/employee';

interface EmployeeSheetProps {
  employee?: SafeEmployee;
  children?: React.ReactNode;
  allTechnologies: { id: number; name: string }[];
  allPositions: { id: number; name: string }[];
}

export function EmployeeSheet({
  employee,
  children,
  allTechnologies,
  allPositions,
}: EmployeeSheetProps) {
  const [open, setOpen] = useState(false);
  const isEdit = !!employee;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children ? (
          children
        ) : (
          <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2 cursor-pointer">
            <Plus size={18} />
            Dodaj pracownika
          </Button>
        )}
      </SheetTrigger>

      <SheetContent className="bg-[#0B1121] border-l border-slate-800 text-white sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-white text-xl font-bold">
            {isEdit ? 'Edytuj pracownika' : 'Nowy pracownik'}
          </SheetTitle>
          <SheetDescription className="text-slate-400">
            {isEdit
              ? 'Wprowadź zmiany w danych pracownika.'
              : 'Wypełnij formularz, aby dodać nową osobę do zespołu.'}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-8">
          <EmployeeForm
            initialData={employee}
            allTechnologies={allTechnologies}
            allPositions={allPositions}
            onSuccess={() => setOpen(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
