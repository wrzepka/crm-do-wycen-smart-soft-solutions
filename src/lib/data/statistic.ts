import { prisma } from '@/lib/prisma-client';
import { Decimal } from '@prisma/client-runtime-utils';

export async function getAcceptedFinancialSummary() {
  try {
    const result = await prisma.pricing_history.aggregate({
      where: {
        is_current_version: true,
        status: 'ACCEPTED',
      },
      _sum: {
        total_gross: true, // gross revenue
        total_cost: true, // costs
      },
    });

    const totalRevenue = result._sum.total_gross ?? new Decimal(0);
    const totalCost = result._sum.total_cost ?? new Decimal(0);
    const totalMargin = totalRevenue.sub(totalCost);

    return {
      totalRevenue: totalRevenue.toFixed(2),
      totalCost: totalCost.toFixed(2),
      totalMargin: totalMargin.toFixed(2),
    };
  } catch (error) {
    console.error('Błąd pobierania podsumowania finansowego:', error);
    throw new Error('Nie udało się pobrać statystyk finansowych.');
  }
}
export async function getLastYearAcceptedFinancialSummary() {
  try {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear(), 11, 31);
    const result = await prisma.pricing_history.aggregate({
      where: {
        is_current_version: true,
        status: 'ACCEPTED',
        quote_date: {
          gte: startOfYear,
          lte: endOfYear,
        },
      },
      _sum: {
        total_gross: true, // gross revenue
        total_cost: true, // costs
      },
    });

    const totalRevenue = result._sum.total_gross ?? new Decimal(0);
    const totalCost = result._sum.total_cost ?? new Decimal(0);
    const totalMargin = totalRevenue.sub(totalCost);

    return {
      totalRevenue: totalRevenue.toFixed(2),
      totalCost: totalCost.toFixed(2),
      totalMargin: totalMargin.toFixed(2),
      period: {
        start: startOfYear.toISOString().split('T')[0],
        end: endOfYear.toISOString().split('T')[0],
      },
    };
  } catch (error) {
    console.error('Błąd pobierania podsumowania finansowego:', error);
    throw new Error('Nie udało się pobrać statystyk finansowych.');
  }
}

export async function getLastMonthAcceptedFinancialSummary() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const result = await prisma.pricing_history.aggregate({
      where: {
        is_current_version: true,
        status: 'ACCEPTED',
        quote_date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      _sum: {
        total_gross: true, // gross revenue
        total_cost: true, // costs
      },
    });

    const totalRevenue = result._sum.total_gross ?? new Decimal(0);
    const totalCost = result._sum.total_cost ?? new Decimal(0);
    const totalMargin = totalRevenue.sub(totalCost);

    return {
      totalRevenue: totalRevenue.toFixed(2),
      totalCost: totalCost.toFixed(2),
      totalMargin: totalMargin.toFixed(2),
      period: {
        start: startOfMonth.toISOString().split('T')[0],
        end: endOfMonth.toISOString().split('T')[0],
      },
    };
  } catch (error) {
    console.error('Błąd pobierania podsumowania finansowego:', error);
    throw new Error('Nie udało się pobrać statystyk finansowych.');
  }
}

export async function getAcceptedFinancialStats() {
  try {
    const result = await prisma.pricing_history.aggregate({
      where: {
        is_current_version: true,
        status: 'ACCEPTED',
      },
      _sum: {
        total_gross: true,
        total_cost: true,
        total_net: true,
        discount: true,
      },
      _count: {
        id: true,
      },
    });

    return {
      totalRevenue: (result._sum.total_gross ?? new Decimal(0)).toFixed(2),
      totalCost: (result._sum.total_cost ?? new Decimal(0)).toFixed(2),
      totalNet: (result._sum.total_net ?? new Decimal(0)).toFixed(2),
      totalDiscount: (result._sum.discount ?? new Decimal(0)).toFixed(2),
      invoiceCount: result._count.id,
    };
  } catch (error) {
    console.error('Błąd pobierania podsumowania finansowego:', error);
    throw new Error('Nie udało się pobrać statystyk finansowych.');
  }
}
export async function getHourlyRateStatistics() {
  try {
    // get all resources with unit 'h' from accepted pricing services
    const resources = await prisma.pricingServiceResource.findMany({
      where: {
        unit: 'h',
        pricingService: {
          pricingHistory: {
            is_current_version: true,
            status: 'ACCEPTED',
          },
        },
      },
      include: {
        position: true,
      },
    });

    if (resources.length === 0) {
      return {
        overall: {
          avgHourlyRate: 0,
          avgHourlyCost: 0,
          avgMargin: 0,
          totalHours: 0,
        },
        byPosition: [],
      };
    }

    // calculate total hours, total revenue, total cost
    let totalHours = new Decimal(0);
    let totalRevenue = new Decimal(0);
    let totalCost = new Decimal(0);

    // group by position
    const positionStats = new Map<
      number,
      {
        positionId: number;
        positionName: string;
        totalHours: Decimal;
        totalRevenue: Decimal;
        totalCost: Decimal;
      }
    >();

    resources.forEach((resource) => {
      const hours = new Decimal(resource.quantity);
      const rate = new Decimal(resource.unit_price);
      const cost = new Decimal(resource.unit_cost);

      totalHours = totalHours.add(hours);
      totalRevenue = totalRevenue.add(hours.mul(rate));
      totalCost = totalCost.add(hours.mul(cost));

      // group by position
      if (resource.positionId) {
        if (!positionStats.has(resource.positionId)) {
          positionStats.set(resource.positionId, {
            positionId: resource.positionId,
            positionName: resource.position?.name || `Stanowisko ${resource.positionId}`,
            totalHours: new Decimal(0),
            totalRevenue: new Decimal(0),
            totalCost: new Decimal(0),
          });
        }

        const stat = positionStats.get(resource.positionId)!;
        stat.totalHours = stat.totalHours.add(hours);
        stat.totalRevenue = stat.totalRevenue.add(hours.mul(rate));
        stat.totalCost = stat.totalCost.add(hours.mul(cost));
      }
    });

    // calculate average hourly rate, cost and margin
    const avgHourlyRate = totalHours.gt(0) ? totalRevenue.div(totalHours).toNumber() : 0;
    const avgHourlyCost = totalHours.gt(0) ? totalCost.div(totalHours).toNumber() : 0;
    const avgMargin = avgHourlyRate - avgHourlyCost;
    const byPosition = Array.from(positionStats.values()).map((stat) => {
      const positionAvgRate = stat.totalHours.gt(0)
        ? stat.totalRevenue.div(stat.totalHours).toNumber()
        : 0;

      const positionAvgCost = stat.totalHours.gt(0)
        ? stat.totalCost.div(stat.totalHours).toNumber()
        : 0;

      const margin = positionAvgRate - positionAvgCost;

      return {
        positionId: stat.positionId,
        positionName: stat.positionName,
        avgHourlyRate: positionAvgRate,
        avgHourlyCost: positionAvgCost,
        margin: margin,
        totalHours: stat.totalHours.toNumber(),
      };
    });

    return {
      overall: {
        avgHourlyRate,
        avgHourlyCost,
        avgMargin,
        totalHours: totalHours.toNumber(),
      },
      byPosition: byPosition.sort((a, b) => b.totalHours - a.totalHours),
    };
  } catch (error) {
    console.error('Błąd pobierania statystyk godzinowych:', error);
    throw new Error('Nie udało się pobrać statystyk godzinowych.');
  }
}
