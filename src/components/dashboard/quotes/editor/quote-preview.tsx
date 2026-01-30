'use client';

import { useFormContext } from 'react-hook-form';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { QuoteFormValues } from './quote-editor';

export function QuotePreview() {
    // Nasłuchujemy wszystkich zmian w formularzu
    const { watch } = useFormContext<QuoteFormValues>();
    const formData = watch();

    const services = formData.services || [];

    // Obliczanie sum
    const totalNet = services.reduce((acc, service) => {
        // Zabezpieczenie przed undefined resources
        const resources = service.resources || [];

        const serviceTotal = resources.reduce((resAcc, res) => {
            const qty = Number(res.quantity) || 0;
            const price = Number(res.unit_price) || 0;
            return resAcc + (qty * price);
        }, 0);

        return acc + serviceTotal - (Number(service.discount) || 0);
    }, 0) - (Number(formData.discount) || 0);

    const vatRate = Number(formData.vat_rate) || 23;
    const totalVat = totalNet * (vatRate / 100);
    const totalGross = totalNet + totalVat;

    return (
        <div className="p-8 lg:p-12 min-h-screen bg-white text-slate-900 font-sans text-sm">
            <div className="flex justify-between items-start mb-12">
                <div>
                    <div className="h-10 w-32 bg-slate-100 rounded mb-4 flex items-center justify-center text-slate-400 font-bold tracking-widest">
                        LOGO
                    </div>
                    <div className="text-xs text-slate-500 leading-relaxed">
                        <strong>Smart Soft Solutions</strong><br />
                        ul. Przykładowa 123<br />
                        00-001 Warszawa<br />
                        NIP: 123-456-78-90
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="text-2xl font-light text-slate-800 mb-1">OFERTA</h2>
                    <p className="font-mono text-slate-500 mb-4"># SZKIC</p>
                    <div className="text-xs text-slate-500">
                        Data: {formData.quote_date ? format(formData.quote_date, 'dd.MM.yyyy') : '-'}
                    </div>
                </div>
            </div>

            <div className="mb-12">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Odbiorca</h3>
                <div className="text-base font-medium">
                    {formData.client_id ? `Klient ID: ${formData.client_id}` : 'Wybierz klienta...'}
                </div>
            </div>

            <div className="mb-8">
                <table className="w-full">
                    <thead className="border-b border-slate-200">
                        <tr>
                            <th className="text-left py-2 font-medium text-slate-500 w-[50%]">Opis</th>
                            <th className="text-right py-2 font-medium text-slate-500">Ilość</th>
                            <th className="text-right py-2 font-medium text-slate-500">Cena</th>
                            <th className="text-right py-2 font-medium text-slate-500">Suma</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {services.length === 0 && (
                            <tr>
                                <td colSpan={4} className="py-8 text-center text-slate-300 italic">
                                    Brak pozycji w ofercie. Dodaj usługi w panelu po lewej.
                                </td>
                            </tr>
                        )}
                        {services.map((service, idx) => {
                            const resources = service.resources || [];
                            return (
                                <>
                                    <tr key={`svc-${idx}`} className="bg-slate-50">
                                        <td colSpan={4} className="py-2 px-2 font-medium text-slate-700">
                                            {service.name || 'Bez nazwy'}
                                        </td>
                                    </tr>
                                    {resources.map((res, rIdx) => (
                                        <tr key={`res-${idx}-${rIdx}`}>
                                            <td className="py-3 pl-4 text-slate-600">{res.label}</td>
                                            <td className="py-3 text-right">{res.quantity} {res.unit}</td>
                                            <td className="py-3 text-right">{Number(res.unit_price).toFixed(2)}</td>
                                            <td className="py-3 text-right font-medium">
                                                {(Number(res.quantity || 0) * Number(res.unit_price || 0)).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <Separator className="my-6" />

            <div className="flex justify-end">
                <div className="w-64 space-y-2">
                    <div className="flex justify-between text-slate-500">
                        <span>Suma Netto:</span>
                        <span>{totalNet.toFixed(2)} {formData.currency}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                        <span>VAT ({vatRate}%):</span>
                        <span>{totalVat.toFixed(2)} {formData.currency}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold text-slate-800 mt-2">
                        <span>Do zapłaty:</span>
                        <span>{totalGross.toFixed(2)} {formData.currency}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}