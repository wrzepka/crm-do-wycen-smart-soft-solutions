'use client'; // Marking as Client Component

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';
import { Loader2, Cpu } from 'lucide-react';
import { z } from 'zod';
import { newTechnologySchema } from '@/lib/schemas/technologySchema';
import { createTechnology, updateTechnology } from '@/lib/actions/technology-actions';

// We infer the form type from the 'new' schema since the input is just the name
type TechnologyFormValues = z.infer<typeof newTechnologySchema>;

interface TechnologyFormProps {
  // We can use a simpler type here since we just need id and name
  initialData?: { id: number; name: string } | null;
  onSuccess?: () => void;
}

export function TechnologyForm({ initialData, onSuccess }: TechnologyFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<TechnologyFormValues>({
    resolver: zodResolver(newTechnologySchema),
    defaultValues: {
      name: initialData?.name || '',
    },
  });

  async function onSubmit(values: TechnologyFormValues) {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('name', values.name);

      let result;

      // Determine if we are updating or creating based on initialData existence
      if (initialData?.id) {
        result = await updateTechnology(initialData.id, formData);
      } else {
        result = await createTechnology(formData);
      }

      // Handling response based on your action structure { ok: boolean, error?: string }
      if (result.ok) {
        toast.success(initialData ? 'Zaktualizowano technologię' : 'Dodano nową technologię');
        router.refresh();
        if (onSuccess) onSuccess();
      } else {
        // POPRAWKA: Zamiast 'as any', rzutujemy na obiekt, który może mieć pole error
        const errorMsg = (result as { error?: string }).error;
        toast.error(errorMsg || 'Wystąpił błąd');
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-2">
        {/* Main container with styling matching the employee form */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-5 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-400 mb-2 border-b border-slate-800 pb-2">
              <Cpu size={14} className="text-blue-500" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Szczegóły
              </span>
            </div>

            {/* Single input field for Technology Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-slate-500">Nazwa Technologii</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="np. React, Python, AWS"
                      {...field}
                      className="bg-slate-950 border-slate-800 focus:border-blue-500/50 text-sm h-9 text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Footer with submit button */}
        <div className="pt-2">
          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white h-9 text-sm font-medium shadow-md shadow-blue-900/10 transition-all"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Przetwarzanie...
              </>
            ) : initialData ? (
              'Zapisz zmiany'
            ) : (
              'Dodaj technologię'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
