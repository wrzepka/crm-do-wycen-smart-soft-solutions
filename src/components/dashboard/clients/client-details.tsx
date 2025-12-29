import { ClientWithRelations } from '@/types/client';
import { MapPinHouse, Contact } from 'lucide-react';

export function ClientDetails({ client }: { client: ClientWithRelations }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <section className="space-y-4">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-400 uppercase tracking-wider">
          <Contact size={18} className="text-slate-500" />
          Informacje kontaktowe
        </h4>
        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 space-y-4">
          <p className="text-lg font-medium text-white">
            {client.first_name} {client.last_name}
          </p>
          <p className="text-slate-300">{client.email}</p>
          <p className="text-slate-300">{client.phone || 'Brak telefonu'}</p>
        </div>
      </section>

      <section className="space-y-4">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-400 uppercase tracking-wider">
          <MapPinHouse size={18} className="text-slate-500" />
          Szczegóły firmy
        </h4>
        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 space-y-4">
          <div>
            <p className="text-xs text-slate-500 uppercase">NIP</p>
            <p className="text-white font-mono">{client.client_addresses?.nip || '---'}</p>
          </div>

          <div>
            <p className="text-xs text-slate-500 uppercase">Adres siedziby</p>
            {client.client_addresses ? (
              <div className="text-white">
                <p>
                  {client.client_addresses.street} {client.client_addresses.building_number}
                </p>
                <p>
                  {client.client_addresses.postal_code} {client.client_addresses.city}
                </p>
              </div>
            ) : (
              <p className="text-slate-500 italic">Brak danych adresowych</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
