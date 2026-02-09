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
    const serviceQuantity = data[0]._count.name;
    const totalServiceNet = data[0]._sum.total_net ?? new Decimal(0);
    const totalServiceCost = data[0]._sum.total_cost ?? new Decimal(0);
    const totalProfit = totalServiceNet.sub(totalServiceCost);

    const calculatedMargin = totalProfit.gt(0)
      ? totalProfit.div(totalServiceNet).mul(100)
      : new Decimal(0);

    return {
      name: serviceName,
      quantity: serviceQuantity,
      totalNet: totalServiceNet.toFixed(2),
      totalCost: totalServiceCost.toFixed(2),
      margin: calculatedMargin.toNumber(),
    };
  } catch (error) {
    console.error('Błąd pobierania danych:', error); // debug log
    throw new Error('Nie udało się pobrać statystyk. Spróbuj odświeżyć stronę.');
  }
}

export async function getMostProfitService() {
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
        _sum: {
          total_net: 'desc',
        },
      },
      take: 5,
    });

    if (data == null || data.length == 0) {
      return null;
    }

    const servicesWithProfit = data.map((service) => {
      const net = service._sum.total_net ?? new Decimal(0);
      const cost = service._sum.total_cost ?? new Decimal(0);

      const profit = net.sub(cost);

      return {
        name: service.name,
        net: net,
        cost: cost,
        profit: profit,
        quantity: service._count.name,
      };
    });

    const mostProfitableService = servicesWithProfit.sort((a, b) =>
      a.profit.sub(b.profit).toNumber(),
    )[0];

    const calculatedMargin = mostProfitableService.profit.div(mostProfitableService.net).mul(100);

    const serviceName = mostProfitableService.name;
    const serviceQuantity = mostProfitableService.quantity;
    const totalServiceNet = mostProfitableService.net;
    const totalServiceCost = mostProfitableService.cost;

    return {
      name: serviceName,
      quantity: serviceQuantity,
      totalNet: totalServiceNet.toFixed(2),
      totalCost: totalServiceCost.toFixed(2),
      margin: calculatedMargin.toNumber(),
    };
  } catch (error) {
    console.error('Błąd pobierania danych:', error); // debug log
    throw new Error('Nie udało się pobrać statystyk. Spróbuj odświeżyć stronę.');
  }
}
