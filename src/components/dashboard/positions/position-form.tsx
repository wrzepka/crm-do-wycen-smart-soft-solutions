'use client';

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
import { Loader2, Briefcase } from 'lucide-react';
import { positions } from '@/generated/prisma/client';
import { newPositionSchema, type NewPositionInput } from '@/lib/schemas/positionSchema';
// POPRAWKA: Importujemy obie akcje
import { createPosition, updatePosition } from '@/lib/actions/position-actions';

interface PositionFormProps {
  initialData?: positions | null;
  onSuccess?: () => void;
}

export function PositionForm({ initialData, onSuccess }: PositionFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<NewPositionInput>({
    resolver: zodResolver(newPositionSchema),
    defaultValues: {
      name: initialData?.name || '',
    },
  });

  async function onSubmit(values: NewPositionInput) {
    startTransition(async () => {
      let result;

      if (initialData?.id) {
        // POPRAWKA: Wywołujemy updatePosition zamiast toasta
        result = await updatePosition(initialData.id, values);
      } else {
        result = await createPosition(values);
      }

      if (result.ok) {
        toast.success(initialData ? 'Zaktualizowano stanowisko' : 'Dodano stanowisko');
        router.refresh();
        if (onSuccess) onSuccess();
      } else if (result.error) {
        toast.error(result.error);
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-2">
        <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-5 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-400 mb-2 border-b border-slate-800 pb-2">
              <Briefcase size={14} className="text-blue-500" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Dane stanowiska
              </span>
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-slate-500">Nazwa Stanowiska</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="np. Senior Developer"
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
              'Dodaj stanowisko'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
