/**
 * @jest-environment node
 */

import { clearDatabase, seedDatabase } from '@/__tests__/utils';
import { prisma } from '@/lib/prisma-client';
import {
  createTechnology,
  deleteTechnology,
  setEmployeeTechnologies,
  updateTechnology,
} from '@/lib/actions/technology-actions';

//TODO: implement auth testing after adding it to the functions.

describe('Technology actions (Integration)', () => {
  // close connection after every test
  afterAll(async () => {
    await prisma.$disconnect();
  });
  // clear db after every test
  beforeEach(async () => {
    await clearDatabase();
  });

  describe('createTechnology', () => {
    it('should create a new Technology', async () => {
      const formData = new FormData();

      formData.append('name', 'React');

      const result = await createTechnology(formData);

      expect(result.ok).toBe(true);
    });
  });

  describe('updateTechnology', () => {
    it('should update existing Technology', async () => {
      const formData = new FormData();

      formData.append('name', 'TS');

      const seedResult = await seedDatabase();
      const result = await updateTechnology(seedResult.reactId, formData);

      expect(result.ok).toBe(true);

      const findTech = await prisma.technologies.findFirst({
        where: {
          name: 'TS',
        },
      });

      expect(findTech).not.toBeNull();
      expect(findTech?.id).toEqual(seedResult.reactId);
    });
  });

  describe('deleteTechnology', () => {
    it('should delete existing Technology', async () => {
      const newTech = await prisma.technologies.create({
        data: {
          name: 'TS',
        },
      });

      const result = await deleteTechnology(newTech.id);
      expect(result.ok).toBe(true);

      const findTech = await prisma.technologies.findFirst({
        where: {
          name: 'React',
        },
      });

      expect(findTech).toBeNull();
    });
  });

  describe('setTechnology', () => {
    it('should set technology to the employee', async () => {
      const seedResult = await seedDatabase();
      const newTech = await prisma.technologies.create({
        data: {
          name: 'TS',
        },
      });

      const techArray = [newTech.id];

      const result = await setEmployeeTechnologies(seedResult.seniorId, techArray);
      expect(result.ok).toBe(true);
    });
  });
});
