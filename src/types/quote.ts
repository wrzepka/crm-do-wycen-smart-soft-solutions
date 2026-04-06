import { Prisma } from '@/generated/prisma/client';

export type QuoteDataForPdf = Prisma.pricing_historyGetPayload<{
  include: {
    client: {
      include: {
        client_addresses: true;
      };
    };
    pricingServices: {
      include: {
        serviceResources: {
          include: {
            position: true;
          };
        };
      };
    };
  };
}>;
