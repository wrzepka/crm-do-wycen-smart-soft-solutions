'use client';

import { useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import {
    Building2,
    Calendar,
    CheckCircle2,
    Clock,
    Mail,
    TrendingUp,
    Wallet,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { QuoteFormValues } from './quote-editor';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface QuotePreviewProps {
    clients: any[];
}

export function QuotePreview({ clients }: QuotePreviewProps) {
    const { control } = useFormContext<QuoteFormValues>();
    const formData = useWatch({ control });

    // Stan do zwijania/rozwijania listy usług
    const [isServicesExpanded, setIsServicesExpanded] = useState(true);

    if (!formData) return null;

    // --- 1. Dane Klienta ---
    const selectedClientId = Number(formData.client_id);
    const client = clients.find(c => c.id === selectedClientId);

    const clientName = client
        ? `${client.first_name} ${client.last_name}`
        : 'Nie wybrano klienta';

    const clientSubtext = client?.company_name || client?.email || 'Brak danych firmy';

    // --- 2. Obliczenia ---
    const services = formData.services || [];
    const currency = formData.currency || 'PLN';
    const status = formData.status || 'DRAFT';

    let totalNet = 0;
    let totalCost = 0;

    services.forEach(service => {
        const resources = service?.resources || [];
        const serviceRevenue = resources.reduce((acc: number, res: any) => acc + (Number(res.quantity || 0) * Number(res.unit_price || 0)), 0);
        const serviceCost = resources.reduce((acc: number, res: any) => acc + (Number(res.quantity || 0) * Number(res.unit_cost || 0)), 0);
        totalNet += serviceRevenue;
        totalCost += serviceCost;
    });

    const globalDiscount = Number(formData.discount) || 0;
    totalNet = Math.max(0, totalNet - globalDiscount);
    const vatRate = Number(formData.vat_rate) || 23;
    const totalVat = totalNet * (vatRate / 100);
    const totalGross = totalNet + totalVat;
    const marginValue = totalNet - totalCost;
    const marginPercent = totalNet > 0 ? ((marginValue / totalNet) * 100).toFixed(1) : '0.0';

    const formatMoney = (val: number) =>
        new Intl.NumberFormat('pl-PL', { style: 'currency', currency: currency }).format(val);

    return (
        <div className="h-full flex flex-col bg-white dark:bg-slate-950 font-sans shadow-sm min-h-full">

            {/* --- SEKCJA GÓRNA: HEADER --- */}
            <div className="p-8 pb-4 shrink-0">
                <div className="flex justify-between items-start mb-6">
                    <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Data wyceny</p>
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium text-sm">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            {formData.quote_date ? format(new Date(formData.quote_date), 'dd MMMM yyyy', { locale: pl }) : '-'}
                        </div>
                    </div>
                    <Badge
                        variant="outline"
                        className={`
                            px-3 py-1 text-xs tracking-wider font-semibold border-0
                            ${status === 'DRAFT' ? 'bg-slate-100 text-slate-600' : 'bg-green-100 text-green-700'}
                        `}
                    >
                        {status === 'DRAFT' ? 'SZKIC' : status}
                    </Badge>
                </div>

                <div className="group relative pl-4 border-l-2 border-blue-500 transition-all duration-300 hover:border-l-4">
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Przygotowano dla</p>
                    <h2 className={`text-2xl font-bold tracking-tight ${!client ? 'text-slate-300' : 'text-slate-900 dark:text-white'}`}>
                        {clientName}
                    </h2>
                    <div className="flex items-center gap-2 mt-1 text-slate-500 text-sm">
                        {client?.company_name ? <Building2 className="h-3 w-3" /> : <Mail className="h-3 w-3" />}
                        <span>{clientSubtext}</span>
                    </div>
                </div>
            </div>

            {/* --- KPI --- */}
            <div className="px-8 mb-4 shrink-0">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 flex flex-col justify-between">
                        <span className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1">
                            <Wallet className="h-3 w-3" /> Przychód
                        </span>
                        <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                            {formatMoney(totalNet)}
                        </span>
                    </div>
                    <div className={`rounded-xl p-3 flex flex-col justify-between ${marginValue >= 0 ? 'bg-emerald-50/50 dark:bg-emerald-950/20' : 'bg-red-50/50'}`}>
                        <span className={`text-xs font-medium mb-1 flex items-center gap-1 ${marginValue >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            <TrendingUp className="h-3 w-3" /> Marża
                        </span>
                        <div className="flex items-baseline gap-2">
                            <span className={`text-lg font-bold ${marginValue >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                                {formatMoney(marginValue)}
                            </span>
                            <span className={`text-xs font-semibold ${marginValue >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                {marginPercent}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <Separator className="shrink-0" />

            {/* --- SEKCJA ŚRODKOWA: LISTA USŁUG (COLLAPSIBLE + AUTO GROW) --- */}
            <div className="bg-slate-50/30 dark:bg-slate-900/20 flex-1">
                <Collapsible
                    open={isServicesExpanded}
                    onOpenChange={setIsServicesExpanded}
                    className="w-full"
                >
                    <div className="px-8 py-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => setIsServicesExpanded(!isServicesExpanded)}>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Zakres usług</h3>
                        {/* [POPRAWKA] Dodano type="button" */}
                        <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0 text-slate-400">
                            {isServicesExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                    </div>

                    <CollapsibleContent className="transition-all data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                        <div className="px-8 space-y-1 pb-6 border-y border-slate-100/50">
                            {services.length === 0 ? (
                                <div className="py-8 text-center">
                                    <p className="text-slate-400 text-sm italic">Brak zdefiniowanych usług.</p>
                                </div>
                            ) : (
                                services.map((service, idx) => {
                                    const svcResources = service?.resources || [];
                                    const svcTotal = svcResources.reduce((acc: number, res: any) => acc + (Number(res.quantity || 0) * Number(res.unit_price || 0)), 0);

                                    return (
                                        <div key={idx} className="group flex justify-between items-center py-3 border-b border-slate-100 last:border-0 hover:bg-white px-3 rounded-lg transition-all">
                                            <div className="flex items-start gap-3">
                                                <div className="mt-1">
                                                    <CheckCircle2 className="h-4 w-4 text-blue-500/30 group-hover:text-blue-500 transition-colors" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                                        {service.name || `Usługa #${idx + 1}`}
                                                    </p>
                                                    {svcResources.length > 0 && (
                                                        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {svcResources.length} poz.
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                                                {formatMoney(svcTotal)}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </CollapsibleContent>

                    {!isServicesExpanded && services.length > 0 && (
                        <div className="px-8 pb-4 text-xs text-slate-400 italic">
                            ... ukryto {services.length} usług (rozwiń aby zobaczyć szczegóły) ...
                        </div>
                    )}
                </Collapsible>
            </div>

            {/* --- SEKCJA DOLNA: TOTAL (Zawsze na dole kontenera) --- */}
            <div className="p-8 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 shrink-0 mt-auto">
                <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm text-slate-500">
                        <span>Wartość netto</span>
                        <span className="tabular-nums">{formatMoney(totalNet)}</span>
                    </div>
                    {globalDiscount > 0 && (
                        <div className="flex justify-between text-sm text-emerald-600 font-medium">
                            <span>Przyznany rabat</span>
                            <span className="tabular-nums">- {formatMoney(globalDiscount)}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-sm text-slate-500">
                        <span>Podatek VAT ({vatRate}%)</span>
                        <span className="tabular-nums">{formatMoney(totalVat)}</span>
                    </div>
                </div>

                <Separator className="bg-slate-200 mb-4" />

                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Razem do zapłaty</p>
                    </div>
                    <div className="text-right">
                        <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight tabular-nums">
                            {formatMoney(totalGross)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}