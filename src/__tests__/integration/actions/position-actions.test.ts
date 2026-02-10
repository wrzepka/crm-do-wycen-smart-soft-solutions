/**
 * @jest-environment node
 */

import { clearDatabase, seedDatabase } from '@/__tests__/utils';
import { prisma } from '@/lib/prisma-client';
import { createPosition, deletePosition, updatePosition } from '@/lib/actions/position-actions';
import { exportDefaultDeclaration } from '@babel/types';

//TODO: implement auth testing after adding it to the functions.

describe('Position actions (Integration)', () => {
  // close connection after every test
  afterAll(async () => {
    await prisma.$disconnect();
  });
  // clear db after every test
  beforeEach(async () => {
    await clearDatabase();
  });

  describe('createPosition', () => {
    it('should create new position', async () => {
      const posData = {
        name: 'Senior Dev',
        cost: 120.0,
        rate: 350.0,
      };

      const result = await createPosition(posData);

      expect(result.ok).toBe(true);
    });
  });

  describe('updatePosition', () => {
    it('should update existing position', async () => {
      const seedResult = await seedDatabase();

      const updateData = {
        id: seedResult.seniorId,
        name: 'Senior Dev',
        cost: 120.0,
        rate: 350.0,
      };

      const result = await updatePosition(seedResult.seniorId, updateData);

      expect(result.ok).toBe(true);
    });
  });

  describe('deletePosition', () => {
    it('should delete existing position', async () => {
      const posData = {
        name: 'Test',
        cost: 120.0,
        rate: 350.0,
      };

      await createPosition(posData);

      const findPos = await prisma.positions.findFirst({
        where: {
          name: 'Test',
        },
      });

      if (findPos == null || findPos.id == null) {
        throw new Error('Should find a position');
      }

      const result = await deletePosition(findPos.id);

      expect(result.ok).toBe(true);
    });
  });
});
