'use client';

import { QuoteTemplate } from '@/components/shared/quote-template';
import { QuoteDataExtended } from '@/types/quote';
import { Decimal } from '@prisma/client-runtime-utils';
import dynamic from 'next/dynamic';
const PDFViewer = dynamic(() => import('@react-pdf/renderer').then((mod) => mod.PDFViewer), {
  ssr: false,
  loading: () => <p>Ładowanie podglądu PDF...</p>,
});

// MOCK DATA
const dummyData: QuoteDataExtended = {
  id: 1,
  client_id: 101,
  project_id: 202,
  quote_date: new Date('2024-01-15'),
  quote_code: 'OFERTA/2024/01/DEV',
  cost: new Decimal('12500.00'),
  currency: 'PLN',
  status: 'draft',
  is_paid: false,
  notes: 'Płatność w 2 transzach: 50% zaliczki, 50% po wdrożeniu.',

  client: {
    id: 101,
    first_name: 'Anna',
    last_name: 'Nowak',
    is_lead: false,
    email: 'anna.nowak@firma-klienta.pl',
    phone: '+48 600 700 800',
    client_addresses: {
      id: 50,
      client_id: 101,
      city: 'Warszawa',
      postal_code: '00-123',
      street: 'Aleje Jerozolimskie',
      building_number: '100/12',
      nip: '5250001122',
    },
  },

  project: {
    id: 202,
    client_id: 101,
    employee_id: 5,
    project_details: [
      {
        id: 1,
        project_id: 202,
        project_name: 'System E-commerce B2B',
        description: 'Budowa platformy sprzedażowej z integracją SAP.',
        technologies: 'Next.js, Node.js, PostgreSQL',
        estimated_hours: new Decimal('150.00'),
        estimated_price: new Decimal('25000.00'),
        status: 'in_progress',
        start_date: new Date('2024-02-01'),
        end_date: new Date('2024-05-01'),
      },
    ],
  },

  pricingServices: [
    {
      id: 1,
      pricingHistoryId: 1,
      name: 'Backend & API',
      description: 'Projektowanie bazy danych i API REST.',
      net_price: new Decimal('8000.00'),
      margin_amount: new Decimal('1000.00'),
      discount_amount: new Decimal('50.00'),
      total_price: new Decimal('8950.00'),
      createdAt: new Date(),
      updatedAt: new Date(),

      serviceResources: [
        {
          id: 1,
          pricingServiceId: 1,
          label: 'Prace programistyczne Senior',
          positionId: 1,
          unitPrice: new Decimal('200.00'),
          unit: 'h',
          hours: new Decimal('30.00'),
          totalCost: new Decimal('6000.00'),
          createdAt: new Date(),
          updatedAt: new Date(),
          position: {
            id: 1,
            name: 'Senior Backend Developer',
            hourly_rate: new Decimal('150.00'),
          },
        },
        {
          id: 2,
          pricingServiceId: 1,
          label: 'Analiza Techniczna',
          positionId: 2,
          unitPrice: new Decimal('200.00'),
          unit: 'h',
          hours: new Decimal('10.00'),
          totalCost: new Decimal('2000.00'),
          createdAt: new Date(),
          updatedAt: new Date(),
          position: {
            id: 2,
            name: 'System Architect',
            hourly_rate: new Decimal('180.00'),
          },
        },
      ],
    },
    {
      id: 2,
      pricingHistoryId: 1,
      name: 'Frontend Dashboard',
      description: 'Panel administracyjny dla klienta.',
      net_price: new Decimal('4500.00'),
      margin_amount: new Decimal('500.00'),
      discount_amount: new Decimal('50.00'),
      total_price: new Decimal('4950.00'),
      createdAt: new Date(),
      updatedAt: new Date(),

      serviceResources: [
        {
          id: 3,
          pricingServiceId: 2,
          label: 'Implementacja UI (React)',
          positionId: 3,
          unitPrice: new Decimal('150.00'),
          unit: 'h',
          hours: new Decimal('30.00'),
          totalCost: new Decimal('4500.00'),
          createdAt: new Date(),
          updatedAt: new Date(),
          position: {
            id: 3,
            name: 'Frontend Developer',
            hourly_rate: new Decimal('100.00'),
          },
        },
      ],
    },
  ],
};

export default function DebugPdfPage() {
  return (
    <div className="h-screen w-screen">
      <PDFViewer width="100%" height="100%">
        <QuoteTemplate data={dummyData} />
      </PDFViewer>
    </div>
  );
}
