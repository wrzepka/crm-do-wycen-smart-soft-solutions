'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma-client';
import { TransactionClient } from '@/generated/prisma/internal/prismaNamespace';
import type { UpdatePricingHistoryInput } from '@/types/pricing';

// Helper function to generate unique quote code

export async function generateQuoteCode(): Promise<string> {
  const year = new Date().getFullYear();
  const lastQuote = await prisma.pricing_history.findFirst({
    where: {
      quote_code: {
        startsWith: `OFERTA/${year}/`,
      },
    },
    orderBy: {
      quote_code: 'desc',
    },
  });
  let nextNumber = 1;
  if (lastQuote?.quote_code) {
    const match = lastQuote.quote_code.match(/OFERTA\/\d{4}\/(\d+)/);
    if (match && match[1]) {
      const lastNumber = parseInt(match[1], 10);
      if (!isNaN(lastNumber) && lastNumber > 0) {
        nextNumber = lastNumber + 1;
      }
    }
  }


  // (FIX):
  // We need to check if the generated code is unique, because in rare cases (e.g. concurrent quote creation or data issues) it might already exist. 
  // If it does, we increment the number until we find a free one. 
  // This ensures we never return a duplicate code, even if the last quote's code is not in the expected format 
  // or if there are gaps in the numbering. The performance impact should be minimal since we expect to find a free code within a few iterations at most.
  while (true) {
    const candidateCode = `OFERTA/${year}/${nextNumber.toString().padStart(3, '0')}`;

    const exists = await prisma.pricing_history.findUnique({
      where: { quote_code: candidateCode }
    });

    if (!exists) {
      return candidateCode;
    }

    nextNumber++;
  }
}


// Helper function to round numbers to two decimal places

function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}

// Helper function to get all version IDs in the version chain

export async function getAllVersionIdsInChain(
  tx: TransactionClient,
  startId: number,
): Promise<number[]> {
  const allVersionIds = new Set<number>();
  const queue = [startId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    if (!allVersionIds.has(currentId)) {
      allVersionIds.add(currentId);
      const children = await tx.pricing_history.findMany({
        where: { previousVersionId: currentId },
        select: { id: true },
      });
      for (const child of children) {
        if (!allVersionIds.has(child.id)) {
          queue.push(child.id);
        }
      }
    }
  }

  return Array.from(allVersionIds);
}

// Helper function to get the next version number in the version chain

export async function getNextPricingVersion(
  tx: TransactionClient,
  originalId: number,
): Promise<number> {
  const allVersionIds = new Set<number>();
  const queue = [originalId];
  while (queue.length > 0) {
    const currentId = queue.shift()!;
    allVersionIds.add(currentId);
    const children = await tx.pricing_history.findMany({
      where: { previousVersionId: currentId },
      select: { id: true },
    });
    for (const child of children) {
      if (!allVersionIds.has(child.id)) {
        allVersionIds.add(child.id);
        queue.push(child.id);
      }
    }
  }
  const allVersions = await tx.pricing_history.findMany({
    where: { id: { in: Array.from(allVersionIds) } },
    select: { version: true },
  });
  const maxVersion = allVersions.reduce((max, v) => Math.max(max, v.version), 0);
  return maxVersion + 1;
}

// Helper function to recalculate pricing history totals

export async function recalculatePricingHistoryTotals(
  tx: TransactionClient,
  pricingHistoryId: number,
) {
  const pricing = await tx.pricing_history.findUnique({
    where: { id: pricingHistoryId },
    include: {
      pricingServices: {
        include: { serviceResources: true },
      },
    },
  });

  if (!pricing) return;

  let subtotalNet = 0;
  let totalCost = 0;

  // Przelicz każdą usługę
  for (const service of pricing.pricingServices) {
    let serviceSubtotal = 0;
    let serviceCost = 0;

    for (const resource of service.serviceResources) {
      serviceSubtotal += Number(resource.total_net);
      serviceCost += Number(resource.total_cost);
    }

    const serviceTotalNet = roundToTwoDecimals(serviceSubtotal - Number(service.discount));

    // Aktualizuj usługę
    await tx.pricingService.update({
      where: { id: service.id },
      data: {
        subtotal_net: roundToTwoDecimals(serviceSubtotal),
        total_net: serviceTotalNet,
        total_cost: roundToTwoDecimals(serviceCost),
      },
    });

    subtotalNet += serviceSubtotal;
    totalCost += serviceCost;
  }

  // Przelicz sumy końcowe wyceny
  const totalNet = roundToTwoDecimals(subtotalNet - Number(pricing.discount));
  const totalGross = roundToTwoDecimals(totalNet * (1 + Number(pricing.vat_rate) / 100));

  await tx.pricing_history.update({
    where: { id: pricingHistoryId },
    data: {
      subtotal_net: roundToTwoDecimals(subtotalNet),
      total_net: totalNet,
      total_gross: totalGross,
      total_cost: roundToTwoDecimals(totalCost),
    },
  });
}

// Helper function to mark all previous versions as not current

export async function markPreviousVersionsAsNotCurrent(
  tx: TransactionClient,
  originalId: number,
): Promise<void> {
  const allVersionIds = await getAllVersionIdsInChain(tx, originalId);
  await tx.pricing_history.updateMany({
    where: {
      id: { in: allVersionIds },
    },
    data: { is_current_version: false },
  });
}

// Helper function to create new pricing version when editing is not allowed

export async function createNewPricingVersion(originalId: number, data: UpdatePricingHistoryInput) {
  try {
    const originalPricing = await prisma.pricing_history.findUnique({
      where: { id: originalId },
      include: {
        pricingServices: {
          include: {
            serviceResources: true,
          },
        },
      },
    });

    if (!originalPricing) {
      return { ok: false, error: 'Oryginalna wycena nie została znaleziona.' };
    }

    // Determine which services to use: updated or original
    const servicesToUse =
      data.services && data.services.length > 0
        ? data.services
        : originalPricing.pricingServices.map((service) => {
          // Convert original service to format compatible with UpdatePricingHistoryInput
          const convertedService = {
            name: service.name,
            description: service.description,
            discount: service.discount,
            resources: service.serviceResources.map((resource) => ({
              label: resource.label,
              positionId: resource.positionId,
              unit: resource.unit,
              quantity: resource.quantity,
              unit_price: resource.unit_price,
              unit_cost: resource.unit_cost,
            })),
          };
          return convertedService;
        });

    await prisma.$transaction(async (tx) => {
      // Mark older versions as not current
      await markPreviousVersionsAsNotCurrent(tx, originalId);

      // Get next version number
      const nextVersion = await getNextPricingVersion(tx, originalId);

      // Use new or original data
      const projectId =
        data.project_id !== undefined ? data.project_id : originalPricing.project_id;
      const discount = data.discount !== undefined ? data.discount : originalPricing.discount;
      const vatRate = data.vat_rate !== undefined ? data.vat_rate : originalPricing.vat_rate;
      const currency = data.currency !== undefined ? data.currency : originalPricing.currency;
      const notes =
        data.notes || `Wersja ${nextVersion} wyceny ${originalPricing.quote_code || originalId}`;

      const quoteCode = originalPricing.quote_code
        ? `${originalPricing.quote_code}-v${nextVersion}`
        : await generateQuoteCode();
      // Create new pricing history
      const createdPricing = await tx.pricing_history.create({
        data: {
          client_id: originalPricing.client_id,
          project_id: projectId,
          quote_date: new Date(),
          quote_code: quoteCode,
          subtotal_net: 0,
          discount: discount,
          total_net: 0,
          vat_rate: vatRate,
          total_gross: 0,
          total_cost: 0,
          currency: currency,
          status: 'DRAFT',
          notes: notes,
          version: nextVersion,
          is_current_version: true,
          previousVersionId: originalPricing.id,
        },
      });

      let overallSubtotalNet = 0;
      let overallTotalCost = 0;
      for (const service of servicesToUse) {
        const { resources = [], ...serviceData } = service;
        const serviceName = typeof serviceData.name === 'string' ? serviceData.name : '';
        const serviceDescription = serviceData.description || null;
        const serviceDiscount = Number(serviceData.discount || 0);

        // Create service
        const createdService = await tx.pricingService.create({
          data: {
            name: serviceName,
            description: serviceDescription,
            subtotal_net: 0,
            discount: serviceDiscount,
            total_net: 0,
            total_cost: 0,
            pricingHistoryId: createdPricing.id,
          },
        });
        // Create resources and calculate service totals
        let serviceSubtotalNet = 0;
        let serviceTotalCost = 0;

        for (const resource of resources) {
          if (resource.quantity == null || resource.unit_price == null) {
            throw new Error('Brak ilości lub ceny jednostkowej dla zasobu');
          }

          const qty = Number(resource.quantity);
          const up = Number(resource.unit_price);
          const uc = Number(resource.unit_cost ?? 0);

          if (Number.isNaN(qty) || Number.isNaN(up) || Number.isNaN(uc)) {
            throw new Error('Nieprawidłowe wartości liczbowe dla zasobu');
          }

          const totalNet = up * qty;
          const totalCost = uc * qty;
          const resourceLabel = typeof resource.label === 'string' ? resource.label : '';
          const resourceUnit = typeof resource.unit === 'string' ? resource.unit : 'h';
          const resourcePositionId = resource.positionId || null;

          await tx.pricingServiceResource.create({
            data: {
              label: resourceLabel,
              positionId: resourcePositionId,
              unit: resourceUnit,
              quantity: qty,
              unit_price: up,
              unit_cost: uc,
              total_net: totalNet,
              total_cost: totalCost,
              pricingServiceId: createdService.id,
            },
          });

          serviceSubtotalNet += totalNet;
          serviceTotalCost += totalCost;
        }

        const serviceTotalNet = serviceSubtotalNet - serviceDiscount;

        // Update service with calculated totals
        await tx.pricingService.update({
          where: { id: createdService.id },
          data: {
            subtotal_net: serviceSubtotalNet,
            total_net: serviceTotalNet,
            total_cost: serviceTotalCost,
          },
        });

        overallSubtotalNet += serviceSubtotalNet;
        overallTotalCost += serviceTotalCost;
      }

      // Calculate final totals for new pricing version
      const overallTotalNet = overallSubtotalNet - Number(discount);
      const overallTotalGross = overallTotalNet * (1 + Number(vatRate) / 100);

      // Update new pricing with calculated totals
      await tx.pricing_history.update({
        where: { id: createdPricing.id },
        data: {
          subtotal_net: overallSubtotalNet,
          total_net: overallTotalNet,
          total_gross: overallTotalGross,
          total_cost: overallTotalCost,
        },
      });
    });

    revalidatePath('/dashboard/pricing');
    revalidatePath('/dashboard/clients/[clientId]/pricing', 'page');

    return {
      ok: true,
      message: 'Utworzono nową wersję wyceny z poprawkami.',
    };
  } catch (error) {
    console.error('Create new pricing version error:', error);
    return {
      ok: false,
      error: 'Wystąpił błąd podczas tworzenia nowej wersji wyceny.',
    };
  }
}
