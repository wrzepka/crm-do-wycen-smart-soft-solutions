// src/lib/data/mock-services.ts

export type ServiceType = 'TIME_MATERIAL' | 'FIXED_SCOPE' | 'LICENSE';
export type BillingPeriod = 'MONTHLY' | 'YEARLY' | 'ONE_OFF';

export interface ServiceMock {
  id: string;
  name: string;
  type: ServiceType;
  category: string;
  description: string;
  // Pola dla Time & Material (Rola)
  hourlyRate?: number;
  // Pola dla Fixed Scope (Szablon)
  baseHours?: number;
  // Pola dla License (Infrastruktura)
  price?: number;
  billingPeriod?: BillingPeriod;
  status: 'ACTIVE' | 'ARCHIVED';
}

export const services: ServiceMock[] = [
  {
    id: '1',
    name: 'Senior Backend Developer (Python)',
    type: 'TIME_MATERIAL',
    category: 'Development',
    description: 'Starszy programista backend, stack Python/Django/FastAPI.',
    hourlyRate: 250.0,
    status: 'ACTIVE',
  },
  {
    id: '2',
    name: 'UI/UX Design - Landing Page',
    type: 'FIXED_SCOPE',
    category: 'Design',
    description: 'Szablon wyceny projektu graficznego strony typu Landing Page.',
    baseHours: 40,
    status: 'ACTIVE',
  },
  {
    id: '3',
    name: 'Serwer VPS - Standard (AWS)',
    type: 'LICENSE',
    category: 'Infrastructure',
    description: 'Koszt utrzymania instancji t3.medium.',
    price: 350.0,
    billingPeriod: 'MONTHLY',
    status: 'ACTIVE',
  },
  {
    id: '4',
    name: 'Konsultacje DevOps',
    type: 'TIME_MATERIAL',
    category: 'DevOps',
    description: 'Wsparcie w konfiguracji CI/CD.',
    hourlyRate: 300.0,
    status: 'ACTIVE',
  },
  {
    id: '5',
    name: 'Moduł Płatności (Stripe/PayU)',
    type: 'FIXED_SCOPE',
    category: 'Development',
    description: 'Implementacja podstawowych płatności.',
    baseHours: 24,
    status: 'ACTIVE',
  },
];
