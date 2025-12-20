'use client'; // Marking as Client Component to manage sheet visibility state

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
import { EmployeeWithRelations } from '@/types/employee';

// Props definition allowing the component to handle both creation and editing
interface EmployeeSheetProps {
  employee?: EmployeeWithRelations;
  children?: React.ReactNode;
}

export function EmployeeSheet({ employee, children }: EmployeeSheetProps) {
  // State variable to control the visibility of the side drawer
  const [open, setOpen] = useState(false);
  // Boolean flag derived from props to switch between add and edit modes
  const isEdit = !!employee;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {/* Conditionally rendering custom trigger element or default add button */}
        {children ? (
          children
        ) : (
          <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
            <Plus size={18} />
            Dodaj pracownika
          </Button>
        )}
      </SheetTrigger>

      {/* Main container for the slide-out panel with dark theme styling */}
      <SheetContent className="bg-[#0B1121] border-l border-slate-800 text-white sm:max-w-md">
        <SheetHeader>
          {/* Dynamic header text changing based on the operation type */}
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
          {/* Embedding the form component and closing the sheet upon successful submission */}
          <EmployeeForm initialData={employee} onSuccess={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
