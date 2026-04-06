'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma-client';
import {
  createPricingHistoryWithServicesSchema,
  updatePricingHistoryWithServicesSchema,
  deletePricingHistorySchema,
} from '@/lib/schemas/pricingHistorySchema';
import type {
  CreatePricingHistoryInput,
  UpdatePricingHistoryInput,
  DeletePricingHistoryInput,
} from '@/types/pricing';
import { pricing_historyUpdateInput } from '@/generated/prisma/models/pricing_history';
import { QuoteStatus } from '@/generated/prisma/enums';
import { TransactionClient } from '@/generated/prisma/internal/prismaNamespace';
import { PricingServiceUpdateInput } from '@/generated/prisma/models/PricingService';
import { createVersionSchema } from '@/lib/schemas/pricingHistorySchema';

// import helper functions
import {
  generateQuoteCode,
  getNextPricingVersion,
  recalculatePricingHistoryTotals,
  markPreviousVersionsAsNotCurrent,
  createNewPricingVersion,
} from './pricing-helpers';

// Helper to check if pricing can be edited

function canEditPricing(status: string): boolean {
  const editableStatuses = ['DRAFT'];
  return editableStatuses.includes(status);
}

// Create new pricing history with services

export async function getQuoteVersionsAction(quoteCode: string | null) {
  try {
    if (!quoteCode) return { ok: false, error: 'Brak kodu oferty' };

    const baseCode = quoteCode.replace(/-v\d+$/, '');

    const versions = await prisma.pricing_history.findMany({
      where: {
        quote_code: {
          startsWith: baseCode,
        },
      },
      orderBy: { version: 'desc' },
      select: {
        id: true,
        version: true,
        status: true,
        quote_date: true,
        total_gross: true,
        is_current_version: true,
        quote_code: true,
      },
    });

    const filteredVersions = versions.filter(
      (v) => v.quote_code === baseCode || v.quote_code?.startsWith(`${baseCode}-v`),
    );

    const safeVersions = filteredVersions.map((v) => ({
      ...v,
      total_gross: Number(v.total_gross),
    }));

    return { ok: true, data: safeVersions };
  } catch (error) {
    console.error('Błąd pobierania historii:', error);
    return { ok: false, error: 'Nie udało się pobrać historii wersji' };
  }
}

export async function createPricingHistory(data: CreatePricingHistoryInput) {
  // TODO: Auth check

  const validation = createPricingHistoryWithServicesSchema.safeParse(data);

  if (!validation.success) {
    const errors = validation.error.flatten();
    return {
      ok: false,
      error: 'Błędy walidacji formularza',
      fieldErrors: errors.fieldErrors,
      formErrors: errors.formErrors,
    };
  }

  const { services, ...pricingData } = validation.data;
  const quoteDate = new Date();

  try {
    const quoteCode = await generateQuoteCode();

    await prisma.$transaction(async (tx) => {
      // Calculate overall totals
      let overallSubtotalNet = 0;
      let overallTotalCost = 0;
      const parsedVat = parseInt(String(pricingData.vat_rate ?? 23), 10);
      const safeVatRate = Number.isNaN(parsedVat) ? 23 : parsedVat;
      // Create pricing history first
      const pricingHistory = await tx.pricing_history.create({
        data: {
          client_id: pricingData.client_id,
          project_id: pricingData.project_id || null,
          quote_date: quoteDate,
          quote_code: quoteCode,
          subtotal_net: 0,
          discount: pricingData.discount || 0,
          total_net: 0,
          vat_rate: safeVatRate,
          total_gross: 0,
          total_cost: 0,
          currency: pricingData.currency || 'PLN',
          status: 'DRAFT',
          notes: pricingData.notes || null,
          version: 1,
          is_current_version: true,
        },
      });

      // Create each service with resources
      for (const service of services) {
        const { resources = [], ...serviceData } = service;

        let serviceSubtotalNet = 0;
        let serviceTotalCost = 0;

        // Create service first
        const createdService = await tx.pricingService.create({
          data: {
            name: serviceData.name,
            description: serviceData.description || null,
            subtotal_net: 0,
            discount: serviceData.discount || 0,
            total_net: 0,
            total_cost: 0,
            pricingHistoryId: pricingHistory.id,
          },
        });

        // Create resources for this service and calculate service totals
        for (const resource of resources) {
          // Guard: requierd fields
          if (resource.quantity == null || resource.unit_price == null) {
            throw new Error('Brak ilości lub ceny jednostkowej dla zasobu');
          }

          // parsing numeric fields
          const qty = Number(resource.quantity);
          const up = Number(resource.unit_price);
          const uc = Number(resource.unit_cost ?? 0);

          if (Number.isNaN(qty) || Number.isNaN(up) || Number.isNaN(uc)) {
            throw new Error('Nieprawidłowe wartości liczbowe dla zasobu');
          }

          // calculate totals
          const totalNet = up * qty;
          const totalCost = uc * qty;

          // creating resource
          await tx.pricingServiceResource.create({
            data: {
              label: resource.label,
              positionId: resource.positionId || null,
              unit: resource.unit,
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

        const serviceTotalNet = serviceSubtotalNet - (serviceData.discount || 0);

        // Update service with calculated totals
        await tx.pricingService.update({
          where: { id: createdService.id },
          data: {
            subtotal_net: serviceSubtotalNet,
            total_net: serviceTotalNet,
            total_cost: serviceTotalCost,
          },
        });

        // Add to overall totals
        overallSubtotalNet += serviceSubtotalNet;
        overallTotalCost += serviceTotalCost;
      }

      // Calculate final totals for the pricing history
      const overallDiscount = pricingData.discount || 0;
      const overallTotalNet = overallSubtotalNet - Number(overallDiscount);
      const vatRate = pricingData.vat_rate || 23;
      const overallTotalGross = overallTotalNet * (1 + Number(vatRate) / 100);

      // Update pricing history with calculated totals
      await tx.pricing_history.update({
        where: { id: pricingHistory.id },
        data: {
          subtotal_net: overallSubtotalNet,
          discount: overallDiscount,
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
      message: 'Pomyślnie utworzono wycenę.',
    };
  } catch (error) {
    console.error('Pricing history create error:', error);
    return {
      ok: false,
      error: 'Wystąpił błąd podczas tworzenia wyceny.',
    };
  }
}

// Update pricing history with services

export async function updatePricingHistory(data: UpdatePricingHistoryInput) {
  // TODO: Auth check

  const validation = updatePricingHistoryWithServicesSchema.safeParse(data);

  if (!validation.success) {
    const errors = validation.error.flatten();
    return {
      ok: false,
      error: 'Błędy walidacji formularza',
      fieldErrors: errors.fieldErrors,
      formErrors: errors.formErrors,
    };
  }

  const { id: pricingHistoryId, services, ...pricingData } = validation.data;

  try {
    // Check if pricing history exists
    const existingPricing = await prisma.pricing_history.findUnique({
      where: { id: pricingHistoryId },
    });

    if (!existingPricing) {
      return { ok: false, error: 'Wycena nie została znaleziona.' };
    }

    // If status doesn't allow editing, create a new version
    if (!canEditPricing(existingPricing.status)) {
      return await createNewPricingVersion(pricingHistoryId, data);
    }

    await prisma.$transaction(async (tx: TransactionClient) => {
      // Build safe update object for pricing_history (do not update client_id)
      const updateData: pricing_historyUpdateInput = {};

      if (pricingData.project_id !== undefined) {
        if (pricingData.project_id === null) {
          updateData.project = { disconnect: true };
        } else {
          updateData.project = { connect: { id: pricingData.project_id } };
        }
      }

      if (pricingData.quote_date !== undefined) updateData.quote_date = pricingData.quote_date;
      if (pricingData.quote_code !== undefined)
        updateData.quote_code = pricingData.quote_code ?? null;
      if (pricingData.discount !== undefined) {
        const parsed = Number(pricingData.discount);
        updateData.discount = Number.isNaN(parsed) ? 0 : parsed;
      }
      if (pricingData.vat_rate !== undefined) {
        const parsed = Number(pricingData.vat_rate);
        updateData.vat_rate = Number.isNaN(parsed) ? 23 : parsed;
      }
      if (pricingData.currency !== undefined) updateData.currency = pricingData.currency ?? 'PLN';
      if (pricingData.notes !== undefined) updateData.notes = pricingData.notes ?? null;
      if (pricingData.status !== undefined) updateData.status = pricingData.status;

      // Update main pricing history only if something to change
      if (Object.keys(updateData).length > 0) {
        await tx.pricing_history.update({
          where: { id: pricingHistoryId },
          data: updateData,
        });
      }

      // Determine which services to keep (those with an id in the update)
      const serviceIdsToKeep = services
        .map((s) => ('id' in s ? s.id : null))
        .filter((id): id is number => !!id);

      // [FIX] Deleted if (serviceIdsToKeep.length > 0).
      // Delete always services not included in the update, because if there are no services to keep, we should delete all existing services.
      await tx.pricingService.deleteMany({
        where: {
          pricingHistoryId: pricingHistoryId,
          id: {
            notIn: serviceIdsToKeep,
          },
        },
      });

      // Update or create each service
      for (const service of services) {
        if ('id' in service && service.id) {
          // Update existing service
          const { id: serviceId, resources = [], ...serviceData } = service;

          let serviceSubtotalNet = 0;
          let serviceTotalCost = 0;

          // Determine which resources to keep
          const resourceIdsToKeep = resources
            .map((r) => ('id' in r ? r.id : null))
            .filter((id): id is number => !!id);

          // Delete resources not in the update
          await tx.pricingServiceResource.deleteMany({
            where: {
              pricingServiceId: serviceId,
              id: {
                notIn: resourceIdsToKeep,
              },
            },
          });

          // Update or create resources
          for (const resource of resources) {
            // Validate required numeric fields
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

            if ('id' in resource && resource.id) {
              // Update existing resource with only allowed fields
              const resourceUpdateData: {
                positionId: number | null;
                unit: string;
                quantity: number;
                unit_price: number;
                unit_cost: number;
                total_net: number;
                total_cost: number;
                label?: string;
              } = {
                positionId: resource.positionId || null,
                unit: resource.unit as string,
                quantity: qty,
                unit_price: up,
                unit_cost: uc,
                total_net: totalNet,
                total_cost: totalCost,
              };
              if (resource.label !== undefined) resourceUpdateData.label = resource.label;

              await tx.pricingServiceResource.update({
                where: { id: resource.id },
                data: resourceUpdateData,
              });
            } else {
              // Create new resource
              await tx.pricingServiceResource.create({
                data: {
                  label: resource.label as string,
                  positionId: resource.positionId || null,
                  unit: resource.unit,
                  quantity: qty,
                  unit_price: up,
                  unit_cost: uc,
                  total_net: totalNet,
                  total_cost: totalCost,
                  pricingServiceId: serviceId,
                },
              });
            }

            serviceSubtotalNet += totalNet;
            serviceTotalCost += totalCost;
          }

          const serviceTotalNet = serviceSubtotalNet - (serviceData.discount || 0);

          // Build safe service update object (only provided fields)
          const serviceUpdateData: PricingServiceUpdateInput = {
            subtotal_net: serviceSubtotalNet,
            total_net: serviceTotalNet,
            total_cost: serviceTotalCost,
          };
          if (serviceData.name !== undefined) serviceUpdateData.name = serviceData.name;
          if (serviceData.description !== undefined)
            serviceUpdateData.description = serviceData.description ?? null;
          if (serviceData.discount !== undefined) {
            const parsed = Number(serviceData.discount);
            serviceUpdateData.discount = Number.isNaN(parsed) ? 0 : parsed;
          }

          // Update service with new totals and allowed fields
          await tx.pricingService.update({
            where: { id: serviceId },
            data: serviceUpdateData,
          });
        } else {
          // Create new service
          const { resources = [], ...serviceData } = service;

          let serviceSubtotalNet = 0;
          let serviceTotalCost = 0;

          // Create service first
          const createdService = await tx.pricingService.create({
            data: {
              name: serviceData.name as string,
              description: serviceData.description || null,
              subtotal_net: 0,
              discount: serviceData.discount || 0,
              total_net: 0,
              total_cost: 0,
              pricingHistoryId: pricingHistoryId,
            },
          });

          // Create resources for the new service
          for (const resource of resources) {
            // Validate required numeric fields
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

            await tx.pricingServiceResource.create({
              data: {
                label: resource.label as string,
                positionId: resource.positionId || null,
                unit: resource.unit,
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

          const serviceTotalNet = serviceSubtotalNet - (serviceData.discount || 0);

          // Update service with calculated totals
          await tx.pricingService.update({
            where: { id: createdService.id },
            data: {
              subtotal_net: serviceSubtotalNet,
              total_net: serviceTotalNet,
              total_cost: serviceTotalCost,
            },
          });
        }
      }

      // Recalculate overall totals for the pricing history
      await recalculatePricingHistoryTotals(tx, pricingHistoryId);
    });

    revalidatePath('/dashboard/pricing');
    revalidatePath('/dashboard/clients/[clientId]/pricing', 'page');
    return {
      ok: true,
      message: 'Pomyślnie zaktualizowano wycenę.',
    };
  } catch (error) {
    console.error('Pricing history update error:', error);
    return {
      ok: false,
      error: 'Wystąpił błąd podczas aktualizacji wyceny.',
    };
  }
}

// get all versions of a pricing by pricingId
export async function getPricingVersions(pricingId: number) {
  try {
    let currentId = pricingId;
    const visited = new Set<number>();

    while (true) {
      if (visited.has(currentId)) {
        break;
      }
      visited.add(currentId);

      const current = await prisma.pricing_history.findUnique({
        where: { id: currentId },
        select: { previousVersionId: true },
      });

      if (!current || current.previousVersionId === null) {
        break;
      }

      currentId = current.previousVersionId;
    }
    const rootId = currentId;
    const allVersionIds = new Set<number>();
    const queue = [rootId];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      allVersionIds.add(currentId);

      const children = await prisma.pricing_history.findMany({
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
    const allVersions = await prisma.pricing_history.findMany({
      where: {
        id: { in: Array.from(allVersionIds) },
      },
      include: {
        client: {
          select: { id: true, first_name: true, last_name: true },
        },
        project: {
          select: {
            id: true,
            project_details: {
              select: {
                project_name: true,
              },
              take: 1,
              orderBy: { id: 'desc' },
            },
          },
        },
        pricingServices: {
          include: {
            serviceResources: {
              select: {
                id: true,
                label: true,
                quantity: true,
                unit_price: true,
                unit_cost: true,
                total_net: true,
                total_cost: true,
              },
            },
          },
        },
      },
      orderBy: { version: 'asc' },
    });

    return {
      ok: true,
      data: allVersions,
      currentVersion: allVersions.find((v) => v.is_current_version),
    };
  } catch (error) {
    console.error('Get pricing versions error:', error);
    return {
      ok: false,
      error: 'Wystąpił błąd podczas pobierania wersji wyceny',
    };
  }
}

// Return pricing for revisions (create new DRAFT version from SENT)

export async function returnForRevisions(pricingId: number, notes?: string) {
  try {
    const pricing = await prisma.pricing_history.findUnique({
      where: { id: pricingId },
      include: {
        pricingServices: {
          include: {
            serviceResources: true,
          },
        },
      },
    });

    if (!pricing) {
      return { ok: false, error: 'Wycena nie została znaleziona.' };
    }

    if (pricing.status !== 'SENT') {
      return {
        ok: false,
        error: 'Tylko wysłane wyceny mogą wrócić do poprawek.',
      };
    }

    await prisma.$transaction(async (tx) => {
      const nextVersion = await getNextPricingVersion(tx, pricingId);
      await markPreviousVersionsAsNotCurrent(tx, pricingId);

      const quoteCode = pricing.quote_code
        ? `${pricing.quote_code}-v${nextVersion}`
        : await generateQuoteCode();

      const createdPricing = await tx.pricing_history.create({
        data: {
          client_id: pricing.client_id,
          project_id: pricing.project_id,
          quote_date: new Date(),
          quote_code: quoteCode,
          subtotal_net: 0,
          discount: pricing.discount,
          total_net: 0,
          vat_rate: pricing.vat_rate,
          total_gross: 0,
          total_cost: 0,
          currency: pricing.currency,
          status: 'DRAFT',
          notes: notes || `Powrót do poprawek - wersja ${nextVersion}`,
          version: nextVersion,
          is_current_version: true,
          previousVersionId: pricing.id,
        },
      });
      let overallSubtotalNet = 0;
      let overallTotalCost = 0;
      for (const service of pricing.pricingServices) {
        const createdService = await tx.pricingService.create({
          data: {
            name: service.name,
            description: service.description,
            subtotal_net: 0,
            discount: service.discount,
            total_net: 0,
            total_cost: 0,
            pricingHistoryId: createdPricing.id,
          },
        });

        let serviceSubtotalNet = 0;
        let serviceTotalCost = 0;
        for (const resource of service.serviceResources) {
          const totalNet = Number(resource.total_net);
          const totalCost = Number(resource.total_cost);

          await tx.pricingServiceResource.create({
            data: {
              label: resource.label,
              positionId: resource.positionId,
              unit: resource.unit,
              quantity: resource.quantity,
              unit_price: resource.unit_price,
              unit_cost: resource.unit_cost,
              total_net: totalNet,
              total_cost: totalCost,
              pricingServiceId: createdService.id,
            },
          });

          serviceSubtotalNet += totalNet;
          serviceTotalCost += totalCost;
        }
        const serviceTotalNet = serviceSubtotalNet - Number(service.discount);
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
      const overallTotalNet = overallSubtotalNet - Number(pricing.discount);
      const overallTotalGross = overallTotalNet * (1 + Number(pricing.vat_rate) / 100);
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
      message: 'Wycena wróciła do poprawek. Utworzono nową wersję DRAFT.',
    };
  } catch (error) {
    console.error('Return for revisions error:', error);
    return {
      ok: false,
      error: 'Wystąpił błąd podczas zwracania wyceny do poprawek.',
    };
  }
}

// Delete pricing history

export async function deletePricingHistory(data: DeletePricingHistoryInput) {
  // TODO: Auth check

  const validation = deletePricingHistorySchema.safeParse(data);

  if (!validation.success) {
    return { ok: false, error: 'Błędne ID wyceny' };
  }

  try {
    // Check if pricing can be deleted (only DRAFT status)
    const pricing = await prisma.pricing_history.findUnique({
      where: { id: validation.data.id },
      select: { status: true },
    });

    if (!pricing) {
      return { ok: false, error: 'Wycena nie została znaleziona.' };
    }

    if (pricing.status !== 'DRAFT') {
      return {
        ok: false,
        error: 'Tylko wyceny ze statusem DRAFT mogą zostać usunięte.',
      };
    }

    // It will also delete services and resources (OnDelete: Cascade)
    await prisma.pricing_history.delete({
      where: { id: validation.data.id },
    });

    revalidatePath('/dashboard/pricing');
    revalidatePath('/dashboard/clients/[clientId]/pricing', 'page');
    return {
      ok: true,
      message: 'Pomyślnie usunięto wycenę.',
    };
  } catch (error) {
    console.error('Pricing history delete error:', error);
    return {
      ok: false,
      error: 'Wystąpił błąd podczas usuwania wyceny.',
    };
  }
}

// Status update actions

export async function updatePricingStatus(id: number, status: string, notes?: string) {
  // TODO: Auth check

  try {
    const pricing = await prisma.pricing_history.findUnique({
      where: { id },
    });

    if (!pricing) {
      return { ok: false, error: 'Wycena nie została znaleziona.' };
    }

    const allowedTransitions: Record<string, string[]> = {
      DRAFT: ['SENT'],
      SENT: ['ACCEPTED', 'REJECTED', 'CANCELLED', 'DRAFT'],
      ACCEPTED: ['CANCELLED'],
      REJECTED: ['DRAFT'],
      CANCELLED: [],
    };

    if (!allowedTransitions[pricing.status]?.includes(status)) {
      return {
        ok: false,
        error: `Nie można zmienić statusu z ${pricing.status} na ${status}.`,
      };
    }

    const validStatuses: QuoteStatus[] = ['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'CANCELLED'];

    if (!validStatuses.includes(status as QuoteStatus)) {
      throw new Error(`Invalid status: ${status}`);
    }

    await prisma.pricing_history.update({
      where: { id },
      data: {
        status: { set: status as QuoteStatus },
        ...(notes && { notes }),
      },
    });

    revalidatePath('/dashboard/pricing');
    revalidatePath('/dashboard/clients/[clientId]/pricing', 'page');
    return {
      ok: true,
      message: `Status wyceny zmieniony na ${status}.`,
    };
  } catch (error) {
    console.error('Pricing status update error:', error);
    return {
      ok: false,
      error: 'Wystąpił błąd podczas aktualizacji statusu wyceny.',
    };
  }
}

export async function createNextVersionAction(quoteId: number) {
  const validation = createVersionSchema.safeParse({ quoteId });
  if (!validation.success) {
    return { ok: false, error: 'Nieprawidłowe ID oferty.' };
  }

  const validId = validation.data.quoteId;

  try {
    const currentQuote = await prisma.pricing_history.findUnique({
      where: { id: validId },
    });

    if (!currentQuote || !currentQuote.quote_code) {
      return { ok: false, error: 'Można wersjonować tylko oferty z nadanym numerem.' };
    }

    const result = await createNewPricingVersion(validId, {
      id: validId,
      services: [],
    });

    if (!result.ok || !result.newId) {
      return { ok: false, error: result.error || 'Nie udało się utworzyć nowej wersji' };
    }

    revalidatePath('/dashboard/quotes');

    return {
      ok: true,
      newId: result.newId,
      message: 'Utworzono nową wersję oferty.',
    };
  } catch (error: unknown) {
    console.error('Create Version Error:', error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Wystąpił błąd podczas tworzenia wersji.',
    };
  }
}
