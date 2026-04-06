import { prisma } from '@/lib/prisma-client';

// Function that is used before integration tests to clear up whole db.
export async function clearDatabase() {
  // Select all tables except prismas ones
  const tablenames = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename NOT LIKE '_prisma_%';
  `;

  if (tablenames.length === 0) return;

  // concat tablenames into one string
  const tables = tablenames.map(({ tablename }) => `"${tablename}"`).join(', ');

  // Execute one big truncate operation
  try {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} RESTART IDENTITY CASCADE;`);
  } catch (error) {
    console.error('Error during cleaning DB:', error);
  }
}

export async function seedDatabase() {
  return prisma.$transaction(async (tx) => {
    const positionSenior = await tx.positions.create({
      data: { name: 'Senior', cost: 60.0, rate: 150.0 },
    });

    const positionJunior = await tx.positions.create({
      data: { name: 'Junior', cost: 20.0, rate: 80.0 },
    });

    const technologyReact = await tx.technologies.create({
      data: { name: 'React' },
    });

    const technologyNode = await tx.technologies.create({
      data: { name: 'NodeJS' },
    });

    await tx.users.create({
      data: {
        email: 'manager@nextcrm.pl',
        role: 'MANAGER',
        password_hash: 'hashed_dummy',
      },
    });

    await tx.employees.create({
      data: {
        first_name: 'Jan',
        last_name: 'Kowalski',
        status: 'ACTIVE_AVAILABLE',
        position_id: positionSenior.id,
        employee_technology: {
          create: [{ technology_id: technologyNode.id }, { technology_id: technologyReact.id }],
        },
      },
    });

    await tx.employees.create({
      data: {
        first_name: 'Hubert',
        last_name: 'Kłodawowicz',
        status: 'TERMINATED',
        position_id: positionJunior.id,
      },
    });

    const client = await tx.clients.create({
      data: {
        first_name: 'Anna',
        last_name: 'Nowak',
        email: 'anna.nowak@klient.pl',
        is_lead: true,
        client_addresses: {
          create: {
            city: 'Warszawa',
            postal_code: '00-001',
            street: 'Marszałkowska',
            building_number: '1',
            nip: '5250005840',
          },
        },
      },
    });

    await tx.serviceTemplate.create({
      data: {
        name: 'Szablon MVP Web App',
        resources: {
          create: [
            { label: 'Backend', positionId: positionSenior.id, estimated_quantity: 10, unit: 'h' },
            { label: 'Frontend', positionId: positionJunior.id, estimated_quantity: 20, unit: 'h' },
          ],
        },
      },
    });

    await tx.pricing_history.create({
      data: {
        client_id: client.id,
        quote_code: 'Q-2026-001',
        status: 'DRAFT',
        version: 1,
        subtotal_net: 3900.0,
        total_net: 3900.0,
        total_gross: 4797.0,
        total_cost: 2300.0,
        pricingServices: {
          create: {
            name: 'Dev Phase 1',
            subtotal_net: 3900.0,
            total_net: 3900.0,
            total_cost: 2300.0,
            serviceResources: {
              create: [
                {
                  label: 'Core Logic',
                  positionId: positionSenior.id,
                  quantity: 10,
                  unit_price: 250.0,
                  unit_cost: 150.0,
                  total_net: 2500.0,
                  total_cost: 1500.0,
                  unit: 'h',
                },
                {
                  label: 'UI Views',
                  positionId: positionJunior.id,
                  quantity: 10,
                  unit_price: 140.0,
                  unit_cost: 80.0,
                  total_net: 1400.0,
                  total_cost: 800.0,
                  unit: 'h',
                },
              ],
            },
          },
        },
      },
    });

    return {
      seniorId: positionSenior.id,
      juniorId: positionJunior.id,
      reactId: technologyReact.id,
      nodeId: technologyNode.id,
      clientId: client.id,
    };
  });
}
