'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Loader2, Briefcase, Banknote } from 'lucide-react';
import { z } from 'zod';
import { toast } from 'sonner';

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

// importing new custom number input component
import { NumberInput } from '@/components/ui/number-input';

import { positions } from '@/generated/prisma/client';
import { newPositionSchema } from '@/lib/schemas/positionSchema';
import type { NewPositionInput } from '@/types/position';
import { createPosition, updatePosition } from '@/lib/actions/position-actions';

// type definition derived from zod schema
type PositionFormValues = z.input<typeof newPositionSchema>;

interface PositionFormProps {
  initialData?: positions | null;
  onSuccess?: () => void;
}

export function PositionForm({ initialData, onSuccess }: PositionFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // initializing form with default values or initial data from database
  const form = useForm<PositionFormValues>({
    resolver: zodResolver(newPositionSchema),
    defaultValues: {
      name: initialData?.name || '',
      cost: initialData?.cost ? String(initialData.cost) : '',
      rate: initialData?.rate ? String(initialData.rate) : '',
    },
  });

  async function onSubmit(values: PositionFormValues) {
    startTransition(async () => {
      // casting values to match backend input type expectations
      const baseData = values as unknown as NewPositionInput;

      // determining whether to update existing record or create new one based on initial data
      const result = initialData?.id
        ? await updatePosition(initialData.id, { ...baseData, id: initialData.id })
        : await createPosition(baseData);

      // handling response and refreshing server data
      if (result.ok) {
        toast.success(initialData ? 'Zaktualizowano stanowisko' : 'Dodano stanowisko');
        router.refresh();
        onSuccess?.();
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
                      className="bg-slate-950 border-slate-800 focus:border-blue-500/50 text-sm h-9 text-white transition-colors"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-slate-500 flex items-center gap-1">
                    <Banknote size={14} className="text-slate-400" />
                    Stawka pracownicza (PLN)
                  </FormLabel>
                  <FormControl>
                    {/* using new custom number input component */}
                    <NumberInput
                      placeholder="0.00"
                      step={0.01}
                      min={0}
                      // passing react hook form props directly (onChange, ref, onBlur etc.)
                      {...field}
                      value={(field.value as string | number) ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-slate-500 flex items-center gap-1">
                    <Banknote size={14} className="text-slate-400" />
                    Stawka dla klienta (PLN)
                  </FormLabel>
                  <FormControl>
                    {/* using new custom number input component */}
                    <NumberInput
                      placeholder="0.00"
                      step={0.01}
                      min={0}
                      // passing react hook form props directly (onChange, ref, onBlur etc.)
                      {...field}
                      value={(field.value as string | number) ?? ''}
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
            className="w-full bg-blue-600 hover:bg-blue-700 text-white h-9 text-sm font-medium shadow-md shadow-blue-900/10 transition-all hover:shadow-blue-900/20"
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
