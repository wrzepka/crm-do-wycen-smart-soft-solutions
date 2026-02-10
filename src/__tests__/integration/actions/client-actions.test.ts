/**
 * @jest-environment node
 */

import { clearDatabase } from '@/__tests__/utils';
import { prisma } from '@/lib/prisma-client';
import { createClient } from '@/lib/actions/client-actions';

//TODO: implement auth testing after adding it to the functions.

describe('Client actions (Intergration)', () => {
  // close connection after every test
  afterAll(async () => {
    await prisma.$disconnect();
  });
  // clear db after every test
  beforeEach(async () => {
    await clearDatabase();
  });

  describe('createClient', () => {


    it('should create new client', async () => {
      const formData = new FormData();

      formData.append('first_name', 'Jan');
      formData.append('last_name', 'Testowy');
      formData.append('email', 'jan.testowy@example.com');
      formData.append('phone', '123456789');
      formData.append('is_lead', 'false');

      formData.append('city', 'Warszawa');
      formData.append('postal_code', '00-123');
      formData.append('street', 'Testowa');
      formData.append('building_number', '10');
      formData.append('nip', '5250005840');

      const result = await createClient(formData);

      expect(result.ok).toBe(true);
      expect(result.id && result.message).toBeDefined();

      const findClient = await prisma.clients.findFirst({
        where: {
          first_name: 'Jan',
          last_name: 'Testowy',
        },
        include: {
          client_addresses: true,
        },
      });

      expect(findClient).not.toBeNull();
      expect(findClient?.id).toEqual(result.id);
      expect(findClient?.client_addresses?.client_id).toEqual(result.id);
    });
  });
});
