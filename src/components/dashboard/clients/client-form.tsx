'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { toast } from 'sonner';
import { Loader2, User, MapPin, Building2, Mail, Phone } from 'lucide-react';
import { z } from 'zod';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createClient, updateClient } from '@/lib/actions/client-actions';
import { ClientWithRelations } from '@/types/client';
import { newClientSchema } from '@/lib/schemas/clientSchema';

// local schema with optional address fields to prevent validation blocking
const clientFormSchema = z.object({
  client: newClientSchema,
  address: z.object({
    nip: z.string().optional(),
    street: z.string().optional(),
    building_number: z.string().optional(),
    city: z.string().optional(),
    postal_code: z.string().optional(),
  }),
});

type ClientFormValues = z.infer<typeof clientFormSchema>;

interface ClientFormProps {
  initialData?: ClientWithRelations | null;
  onSuccess?: () => void;
}

export function ClientForm({ initialData, onSuccess }: ClientFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // map initial data to form structure
  const defaultValues: Partial<ClientFormValues> = {
    client: {
      first_name: initialData?.first_name || '',
      last_name: initialData?.last_name || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      is_lead: initialData ? initialData.is_lead : false,
    },
    address: {
      nip: initialData?.client_addresses?.nip || '',
      street: initialData?.client_addresses?.street || '',
      building_number: initialData?.client_addresses?.building_number || '',
      city: initialData?.client_addresses?.city || '',
      postal_code: initialData?.client_addresses?.postal_code || '',
    },
  };

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues,
  });

  async function onSubmit(values: ClientFormValues) {
    startTransition(async () => {
      const formData = new FormData();

      // flatten nested object to formdata for server action
      formData.append('first_name', values.client.first_name);
      formData.append('last_name', values.client.last_name);
      formData.append('email', values.client.email);
      if (values.client.phone) formData.append('phone', values.client.phone);
      formData.append('is_lead', String(values.client.is_lead));

      // append address fields with prefix if present
      if (values.address) {
        if (values.address.nip) formData.append('address_nip', values.address.nip);
        if (values.address.city) formData.append('address_city', values.address.city);
        if (values.address.street) formData.append('address_street', values.address.street);
        if (values.address.postal_code)
          formData.append('address_postal_code', values.address.postal_code);
        if (values.address.building_number)
          formData.append('address_building_number', values.address.building_number);
      }

      let result;
      if (initialData?.id) {
        result = await updateClient(initialData.id, formData);
      } else {
        result = await createClient(formData);
      }

      if (result.ok) {
        toast.success(initialData ? 'Zaktualizowano klienta' : 'Dodano klienta');
        router.refresh();
        if (onSuccess) onSuccess();
      } else {
        toast.error(result.error || 'Wystąpił błąd');
        // log server-side validation errors
        if (result.fieldErrors) {
          console.error('Validation errors:', result.fieldErrors);
        }
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-2">
        <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-5 space-y-6">
          {/* contact details section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-400 mb-2 border-b border-slate-800 pb-2">
              <User size={14} className="text-blue-500" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Dane kontaktowe
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="client.first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-slate-500">Imię</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Jan"
                        {...field}
                        className="bg-slate-950 border-slate-800 focus:border-blue-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="client.last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-slate-500">Nazwisko</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Kowalski"
                        {...field}
                        className="bg-slate-950 border-slate-800 focus:border-blue-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="client.email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-slate-500">Email</FormLabel>
                    <div className="relative">
                      <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                      <FormControl>
                        <Input
                          placeholder="jan@firma.pl"
                          {...field}
                          className="bg-slate-950 border-slate-800 pl-9 focus:border-blue-500"
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="client.phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-slate-500">Telefon</FormLabel>
                    <div className="relative">
                      <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                      <FormControl>
                        <Input
                          placeholder="123 456 789"
                          {...field}
                          value={field.value || ''} // handle null value
                          className="bg-slate-950 border-slate-800 pl-9 focus:border-blue-500"
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="client.is_lead"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-slate-500">Typ relacji</FormLabel>
                  <Select
                    onValueChange={(val) => field.onChange(val === 'true')}
                    defaultValue={field.value ? 'true' : 'false'}
                    value={field.value ? 'true' : 'false'}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-slate-950 border-slate-800 focus:border-blue-500">
                        <SelectValue placeholder="Wybierz typ" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-[#0B1121] border-slate-800 text-slate-200">
                      <SelectItem value="false">Klient (Aktualny)</SelectItem>
                      <SelectItem value="true">Lead (Potencjalny)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* company address section */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-slate-400 mb-2 border-b border-slate-800 pb-2">
              <MapPin size={14} className="text-emerald-500" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Dane firmowe (Opcjonalne)
              </span>
            </div>

            <FormField
              control={form.control}
              name="address.nip"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-slate-500">NIP</FormLabel>
                  <div className="relative">
                    <Building2 className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                    <FormControl>
                      <Input
                        placeholder="0000000000"
                        {...field}
                        className="bg-slate-950 border-slate-800 pl-9 focus:border-blue-500"
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="address.street"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel className="text-xs text-slate-500">Ulica</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Marszałkowska"
                        {...field}
                        className="bg-slate-950 border-slate-800 focus:border-blue-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address.building_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-slate-500">Nr</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="10/2"
                        {...field}
                        className="bg-slate-950 border-slate-800 focus:border-blue-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="address.postal_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-slate-500">Kod</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="00-000"
                        {...field}
                        className="bg-slate-950 border-slate-800 focus:border-blue-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address.city"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel className="text-xs text-slate-500">Miasto</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Warszawa"
                        {...field}
                        className="bg-slate-950 border-slate-800 focus:border-blue-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-900/10 cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Przetwarzanie...
              </>
            ) : initialData ? (
              'Zapisz zmiany'
            ) : (
              'Dodaj klienta'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
