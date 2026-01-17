import { Prisma } from '@/generated/prisma/client';

export type QuoteDataExtended = Prisma.pricing_historyGetPayload<{
  include: {
    client: {
      include: {
        client_addresses: true;
      };
    };
    project: {
      include: {
        project_details: true;
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
