'use client';

import { useForm, FormProvider, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPricingHistoryWithServicesSchema } from '@/lib/schemas/pricingHistorySchema';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, FileText, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createPricingHistory, updatePricingHistory } from '@/lib/actions/pricing-actions';
import { QuoteContextSection } from './quote-context-section';
import { QuotePreview } from './quote-preview';
import { QuoteServicesEditor } from './quote-services-editor';
import { Separator } from '@/components/ui/separator';
import { useMemo } from 'react';
import { CreatePricingHistoryInput, UpdatePricingHistoryInput } from '@/types/pricing';

// --- TYPY FORMULARZA ---

type QuoteFormResource = {
    id?: number | null;
    label: string;
    positionId: number | null;
    unit: string;
    quantity: number;
    unit_price: number;
    unit_cost: number;
    total_net?: number;
    total_cost?: number;
};

type QuoteFormService = {
    id?: number | null;
    name: string;
    description?: string | null;
    discount: number;
    pricingHistoryId?: number | null;
    resources: QuoteFormResource[];
    // Pola kalkulowane
    subtotal_net?: number;
    total_net?: number;
    total_cost?: number;
};

export type QuoteFormValues = {
    client_id: number;
    project_id?: number | null;
    quote_date: Date;
    quote_code?: string | null;
    status: "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "CANCELLED";
    vat_rate: number;
    currency: string;
    notes?: string | null;
    discount: number;
    services: QuoteFormService[];
    // Pola kalkulowane nagłówka
    subtotal_net?: number;
    total_net?: number;
    total_gross?: number;
    total_cost?: number;
};

interface QuoteEditorProps {
    clients: any[];
    projects: any[];
    positions: any[];
    serviceTemplates: any[];
    initialData?: any;
}

export function QuoteEditor({ clients, projects, positions, serviceTemplates, initialData }: QuoteEditorProps) {
    const router = useRouter();
    const isEditMode = !!initialData;

    // Przygotowanie wartości domyślnych
    const defaultValues: QuoteFormValues = useMemo(() => {
        if (initialData) {
            return {
                client_id: Number(initialData.client_id),
                project_id: initialData.project_id ? Number(initialData.project_id) : null,
                quote_date: initialData.quote_date ? new Date(initialData.quote_date) : new Date(),
                quote_code: initialData.quote_code,
                status: initialData.status,
                vat_rate: Number(initialData.vat_rate) || 23,
                currency: initialData.currency || 'PLN',
                notes: initialData.notes || "",
                discount: Number(initialData.discount) || 0,

                subtotal_net: Number(initialData.subtotal_net || 0),
                total_net: Number(initialData.total_net || 0),
                total_gross: Number(initialData.total_gross || 0),
                total_cost: Number(initialData.total_cost || 0),

                services: initialData.pricingServices?.map((s: any) => ({
                    id: s.id,
                    name: s.name,
                    description: s.description || "",
                    discount: Number(s.discount) || 0,
                    pricingHistoryId: initialData.id,

                    subtotal_net: Number(s.subtotal_net || 0),
                    total_net: Number(s.total_net || 0),
                    total_cost: Number(s.total_cost || 0),

                    resources: s.serviceResources?.map((r: any) => ({
                        id: r.id,
                        label: r.label,
                        positionId: r.positionId,
                        unit: r.unit,
                        quantity: Number(r.quantity),
                        unit_price: Number(r.unit_price),
                        unit_cost: Number(r.unit_cost),

                        total_net: Number(r.total_net || 0),
                        total_cost: Number(r.total_cost || 0)
                    })) || []
                })) || []
            };
        }

        return {
            quote_date: new Date(),
            vat_rate: 23,
            currency: 'PLN',
            status: 'DRAFT',
            services: [],
            client_id: 0,
            discount: 0,
            notes: "",
            subtotal_net: 0,
            total_net: 0,
            total_gross: 0,
            total_cost: 0,
        };
    }, [initialData]);

    const methods = useForm<QuoteFormValues>({
        mode: 'onChange',
        resolver: zodResolver(createPricingHistoryWithServicesSchema.passthrough()) as unknown as Resolver<QuoteFormValues>,
        defaultValues,
    });

    const { handleSubmit, formState: { isSubmitting, errors } } = methods;

    const onSubmit = async (formData: QuoteFormValues) => {
        try {
            if (isEditMode && initialData?.id) {
                // --- UPDATE ---
                const payload: UpdatePricingHistoryInput = {
                    id: initialData.id,
                    client_id: Number(formData.client_id),
                    project_id: formData.project_id ? Number(formData.project_id) : null,
                    quote_date: formData.quote_date,
                    quote_code: formData.quote_code,
                    status: formData.status,
                    currency: formData.currency,
                    notes: formData.notes,
                    vat_rate: Number(formData.vat_rate),
                    discount: Number(formData.discount),

                    subtotal_net: Number(formData.subtotal_net || 0),
                    total_net: Number(formData.total_net || 0),
                    total_gross: Number(formData.total_gross || 0),
                    total_cost: Number(formData.total_cost || 0),

                    services: formData.services.map(s => ({
                        id: s.id ?? null,
                        name: s.name,
                        description: s.description,
                        discount: Number(s.discount),
                        pricingHistoryId: initialData.id,

                        // [FIX] Przekazujemy pola kalkulowane usług
                        subtotal_net: Number(s.subtotal_net || 0),
                        total_net: Number(s.total_net || 0),
                        total_cost: Number(s.total_cost || 0),

                        resources: s.resources.map(r => ({
                            id: r.id ?? null,
                            label: r.label,
                            positionId: r.positionId ?? null,
                            unit: r.unit,
                            quantity: Number(r.quantity),
                            unit_price: Number(r.unit_price),
                            unit_cost: Number(r.unit_cost)
                        }))
                    }))
                };

                const result = await updatePricingHistory(payload);

                if (result.ok) {
                    toast.success("Zaktualizowano wycenę");
                    router.push('/dashboard/quotes');
                    router.refresh();
                } else {
                    toast.error(result.error || 'Błąd aktualizacji');
                }

            } else {
                // --- CREATE ---
                const payload: CreatePricingHistoryInput = {
                    client_id: Number(formData.client_id),
                    project_id: formData.project_id ? Number(formData.project_id) : null,
                    quote_date: formData.quote_date,
                    status: formData.status,
                    currency: formData.currency,
                    notes: formData.notes,
                    version: 1,
                    is_current_version: true,
                    vat_rate: Number(formData.vat_rate),
                    discount: Number(formData.discount),

                    // [FIX] Przekazujemy pola kalkulowane nagłówka
                    subtotal_net: Number(formData.subtotal_net || 0),
                    total_net: Number(formData.total_net || 0),
                    total_gross: Number(formData.total_gross || 0),
                    total_cost: Number(formData.total_cost || 0),

                    services: formData.services.map(s => ({
                        name: s.name,
                        description: s.description,
                        discount: Number(s.discount),
                        pricingHistoryId: 0,

                        // [FIX] Przekazujemy pola kalkulowane usług (TERAZ TS BĘDZIE ZADOWOLONY)
                        subtotal_net: Number(s.subtotal_net || 0),
                        total_net: Number(s.total_net || 0),
                        total_cost: Number(s.total_cost || 0),

                        resources: s.resources.map(r => ({
                            label: r.label,
                            positionId: r.positionId ?? null,
                            unit: r.unit,
                            quantity: Number(r.quantity),
                            unit_price: Number(r.unit_price),
                            unit_cost: Number(r.unit_cost)
                        }))
                    }))
                };

                const result = await createPricingHistory(payload);

                if (result.ok) {
                    toast.success(result.message);
                    router.push('/dashboard/quotes');
                } else {
                    toast.error(result.error || 'Wystąpił błąd');
                }
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
                                <h1 className="text-2xl font-bold tracking-tight">
                                    {isEditMode ? `Edycja wyceny ${initialData.quote_code || ''}` : 'Nowa wycena'}
                                </h1>
                                <p className="text-sm text-slate-500">
                                    {isEditMode ? 'Wprowadź zmiany w ofercie.' : 'Wypełnij dane projektu i zakres prac.'}
                                </p>
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
                                <div className="mt-4 text-center bg-red-50 p-2 rounded border border-red-200">
                                    <p className="text-sm text-destructive">
                                        {errors.services.root?.message ||
                                            errors.services.message ||
                                            (Array.isArray(errors.services)
                                                ? "Formularz zawiera błędy w poszczególnych usługach."
                                                : "Wycena musi zawierać przynajmniej jedną usługę.")
                                        }
                                    </p>
                                </div>
                            )}
                        </div>

                        <Separator />
                    </div>
                </div>

                {/* PRAWA KOLUMNA */}
                <div className="w-full lg:w-[45%] xl:w-[40%] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-xl overflow-y-auto lg:sticky lg:top-0 h-full">
                    <QuotePreview clients={clients} />

                    <div className="sticky bottom-0 left-0 right-0 border-t bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-4 flex items-center justify-between z-10">
                        <div className="text-sm text-slate-500">
                            Status: <span className="font-medium text-slate-900">{isEditMode ? initialData.status : 'Nowa'}</span>
                        </div>
                        <div className="flex gap-3">
                            <Button type="button" variant="outline" disabled={isSubmitting}>
                                <FileText className="mr-2 h-4 w-4" /> Podgląd PDF
                            </Button>
                            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                                {isSubmitting ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="mr-2 h-4 w-4" />
                                )}
                                {isEditMode ? 'Zapisz zmiany' : 'Utwórz ofertę'}
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}