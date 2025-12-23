'use client'; // marking this as a client component to allow state and interactivity

import { useState, useTransition } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Plus, X, Loader2 } from 'lucide-react';
import { getColorForTechnology } from '@/lib/utils';
import { updateEmployeeTechnologiesAction } from '@/lib/actions/employee-actions';
import { toast } from 'sonner';

// defining props interface to ensure type safety for input data
interface Props {
  employeeId: number;
  initialTechIds: number[];
  allTechnologies: { id: number; name: string }[];
}

export function EmployeeTechnologiesCell({ employeeId, initialTechIds, allTechnologies }: Props) {
  // state to manage the visibility of the popover
  const [open, setOpen] = useState(false);
  // transition hook to handle pending state during server actions
  const [isPending, startTransition] = useTransition();

  // handles the server action call to update the database
  const handleUpdate = (newIds: number[]) => {
    startTransition(async () => {
      const result = await updateEmployeeTechnologiesAction(employeeId, newIds);
      if (!result.ok) {
        toast.error('Nie udało się zaktualizować technologii');
      }
    });
  };

  // adds a technology id to the list and initiates the update
  const addTech = (techId: number) => {
    const newIds = [...initialTechIds, techId];
    handleUpdate(newIds);
    setOpen(false);
  };

  // removes a technology id from the list and initiates the update
  const removeTech = (techId: number) => {
    const newIds = initialTechIds.filter((id) => id !== techId);
    handleUpdate(newIds);
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 min-w-[200px]">
      {initialTechIds.map((techId) => {
        // finds the technology object based on the id
        const tech = allTechnologies.find((t) => t.id === techId);
        if (!tech) return null;

        return (
          <Badge
            key={tech.id}
            variant="outline"
            className={`group relative pr-5 pl-2 py-0.5 transition-all cursor-default border ${getColorForTechnology(tech.name)} ${isPending ? 'opacity-50' : ''}`}
          >
            {tech.name}
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeTech(tech.id);
              }}
              disabled={isPending}
              className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-black/10 dark:hover:bg-white/20 rounded-full"
            >
              <X size={10} />
            </button>
          </Badge>
        );
      })}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            disabled={isPending}
            className="h-6 w-6 rounded-full border border-dashed border-slate-300 text-slate-400 hover:text-slate-600 hover:border-slate-400 dark:border-slate-700 dark:hover:text-slate-300 bg-transparent cursor-pointer"
          >
            {isPending ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
          </Button>
        </PopoverTrigger>

        {/* popover content with adjusted colors for dark mode */}
        <PopoverContent
          className="p-0 w-[200px] border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1121]"
          align="start"
        >
          <Command className="bg-transparent">
            <CommandInput
              placeholder="Szukaj..."
              className="h-9 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-500"
            />
            <CommandList>
              <CommandEmpty className="py-2 text-xs text-center text-slate-500">
                Brak wyników.
              </CommandEmpty>
              <CommandGroup>
                {allTechnologies
                  // filtering available technologies to exclude already selected ones
                  .filter((t) => !initialTechIds.includes(t.id))
                  .map((tech) => (
                    <CommandItem
                      key={tech.id}
                      value={tech.name}
                      onSelect={() => addTech(tech.id)}
                      // styling for list items to ensure visibility in both modes
                      className="cursor-pointer text-xs py-1.5 px-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 aria-selected:bg-slate-100 dark:aria-selected:bg-slate-800 aria-selected:text-slate-900 dark:aria-selected:text-white"
                    >
                      {tech.name}
                    </CommandItem>
                  ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
