'use client';

import { useForm, FormProvider, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPricingHistoryWithServicesSchema } from '@/lib/schemas/pricingHistorySchema';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, FileText } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createPricingHistory } from '@/lib/actions/pricing-actions';
import { QuoteContextSection } from './quote-context-section';
import { QuotePreview } from './quote-preview';
import { QuoteServicesEditor } from './quote-services-editor';
import { Separator } from '@/components/ui/separator';
import { CreatePricingHistoryInput, CreatePricingServiceInput } from '@/types/pricing';

// --- TYPY ---
// [FIX] Poprawiamy typy, aby pricingHistoryId był opcjonalny
type QuoteFormService = Omit<CreatePricingServiceInput, 'pricingHistoryId'> & {
    pricingHistoryId?: number | null;
};

export type QuoteFormValues = Omit<CreatePricingHistoryInput, 'services'> & {
    quote_date: Date;
    services: QuoteFormService[];
};

interface QuoteEditorProps {
    clients: any[];
    projects: any[];
    positions: any[];
    serviceTemplates: any[];
}

export function QuoteEditor({ clients, projects, positions, serviceTemplates }: QuoteEditorProps) {
    const router = useRouter();

    const methods = useForm<QuoteFormValues>({
        // [FIX] Dodajemy mode: 'onChange', aby walidacja działała na bieżąco
        mode: 'onChange',
        resolver: zodResolver(createPricingHistoryWithServicesSchema.passthrough()) as unknown as Resolver<QuoteFormValues>,
        defaultValues: {
            quote_date: new Date(),
            vat_rate: 23,
            currency: 'PLN',
            status: 'DRAFT',
            services: [],
            client_id: undefined,
        },
    });

    const { handleSubmit, formState: { isSubmitting, errors } } = methods;

    const onSubmit = async (formData: QuoteFormValues) => {
        try {
            // [FIX] Przygotowanie payloadu bez sztucznego ID = 1
            const payload: CreatePricingHistoryInput = {
                ...formData,
                services: formData.services.map(s => {
                    // Usuwamy pricingHistoryId, jeśli jest null/undefined, 
                    // aby Prisma mogła obsłużyć utworzenie relacji automatycznie (nested write)
                    // LUB jeśli Twoja akcja wymaga tego pola, musisz obsłużyć logikę "new" w action.

                    // W tym przypadku zakładam, że jeśli tworzymy nową wycenę, 
                    // to ID zostanie nadane dopiero po zapisie PricingHistory.
                    // Przekazujemy serwis bez tego pola lub z odpowiednią obsługą w backendzie.

                    // Jeśli Twoja schema wymaga pricingHistoryId jako number, 
                    // a tu go nie masz, to w Server Action musisz najpierw stworzyć History,
                    // a potem przypisać ID do usług.

                    // Tymczasowe rozwiązanie bezpieczniejsze niż '1':
                    // Jeśli jest null, nie wysyłamy lub wysyłamy undefined (zależnie od schemy Zod)
                    return {
                        ...s,
                        pricingHistoryId: s.pricingHistoryId || 0 // 0 może być sygnałem dla backendu "to jest nowe"
                    } as any;
                })
            };

            const result = await createPricingHistory(payload);

            if (result.ok) {
                toast.success(result.message);
                router.push('/dashboard/quotes');
            } else {
                toast.error(result.error || 'Wystąpił błąd');
            }
        } catch (error) {
            console.error(error);
            toast.error('Błąd krytyczny aplikacji');
        }
    };

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="flex h-full flex-col lg:flex-row bg-slate-50/50 dark:bg-[#020817]">
                {/* LEWA KOLUMNA */}
                <div className="flex-1 overflow-y-auto p-6 lg:p-10 border-r border-slate-200 dark:border-slate-800">

                    <div className="mb-8 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button variant="outline" size="icon" asChild>
                                <Link href="/dashboard/quotes">
                                    <ArrowLeft className="h-4 w-4" />
                                </Link>
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">Nowa wycena</h1>
                                <p className="text-sm text-slate-500">Wypełnij dane projektu i zakres prac.</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8 max-w-2xl">
                        <QuoteContextSection clients={clients} projects={projects} />
                        <Separator />

                        <div>
                            <QuoteServicesEditor
                                serviceTemplates={serviceTemplates}
                                positions={positions}
                            />

                            {errors.services && (
                                <p className="text-sm text-destructive mt-4 text-center bg-red-50 p-2 rounded border border-red-200">
                                    {/* [FIX] Lepsza obsługa błędów tablicy */}
                                    {errors.services.message || errors.services.root?.message || "Wycena musi zawierać przynajmniej jedną usługę."}
                                </p>
                            )}
                        </div>

                        <Separator />
                    </div>
                </div>

                {/* PRAWA KOLUMNA */}
                <div className="w-full lg:w-[45%] xl:w-[40%] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-xl overflow-y-auto lg:sticky lg:top-0 h-full">
                    <QuotePreview clients={clients} />
                    <div className="sticky bottom-0 left-0 right-0 border-t bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-4 flex items-center justify-between z-10">
                        <div className="text-sm text-slate-500">Status: Szkic</div>
                        <div className="flex gap-3">
                            <Button type="button" variant="outline" disabled={isSubmitting}>
                                <FileText className="mr-2 h-4 w-4" /> Podgląd PDF
                            </Button>
                            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                                <Save className="mr-2 h-4 w-4" /> Zapisz ofertę
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}