import { prisma } from '@/lib/prisma-client';
import { Decimal } from '@prisma/client-runtime-utils';

export async function getMostSoldService() {
  //AUTH

  try {
    const data = await prisma.pricingService.groupBy({
      by: ['name'],
      where: {
        pricingHistory: {
          is_current_version: true,
          status: 'ACCEPTED',
        },
      },
      _count: {
        name: true,
      },
      _sum: {
        total_net: true,
        total_cost: true,
      },
      orderBy: {
        _count: {
          name: 'desc',
        },
      },
      take: 1,
    });

    if (data[0] == null) {
      return null;
    }

    const serviceName = data[0].name;
    const serviceQuantity = data[0]._count;
    const totalServiceNet = data[0]._sum.total_net || new Decimal(0);
    const totalServiceCost = data[0]._sum.total_cost || new Decimal(0);
    const totalProfit = totalServiceNet.sub(totalServiceCost);

    const calculatedMargin = totalProfit.gt(0)
      ? totalProfit.div(totalServiceNet).mul(100)
      : new Decimal(0);

    return {
      name: serviceName,
      quantity: serviceQuantity,
      totalNet: totalServiceNet,
      totalCost: totalServiceCost,
      margin: calculatedMargin,
    };
  } catch (error) {
    console.error('Błąd pobierania danych:', error); // debug log
    throw new Error('Nie udało się pobrać statystyk. Spróbuj odświeżyć stronę.');
  }
}
