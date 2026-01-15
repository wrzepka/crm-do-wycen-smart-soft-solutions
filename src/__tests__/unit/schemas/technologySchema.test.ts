import {
  newTechnologySchema,
  updateTechnologySchema,
  technologyIdsSchema,
} from '@/lib/schemas/technologySchema';

describe('Technology Schemas (Unit)', () => {
  //   ### New technology validation ###
  describe('newTechnologySchema', () => {
    it('should validate correct technology', () => {
      const result = newTechnologySchema.safeParse({ name: 'Next.js' });

      expect(result.success).toBe(true);
    });

    it('should fail if technology name is missing', () => {
      const result = newTechnologySchema.safeParse({ name: '' });

      expect(result.success).toBe(false);
      if (result.success) throw new Error('Validation should failed');

      expect(result.error.flatten().fieldErrors.name).toContain(
        'Nazwa technologii nie może być pusta',
      );
    });

    it('should fail if technology name is too long', () => {
      const longName = 'a'.repeat(101);
      const result = newTechnologySchema.safeParse({ name: longName });

      expect(result.success).toBe(false);
      if (result.success) throw new Error('Validation should failed');

      expect(result.error.flatten().fieldErrors.name).toContain(
        'Nazwa technologii nie może przekraczać 100 znaków',
      );
    });
  });
  //   ### Update technology validation ###
  describe('updateTechnologySchema', () => {
    it('should require ID for update', () => {
      const result = updateTechnologySchema.safeParse({ name: 'Next.js' });

      expect(result.success).toBe(false);
      if (result.success) throw new Error('Validation should failed');

      expect(result.error.flatten().fieldErrors.id).toBeDefined();
    });

    it('should fail if id is negative', () => {
      const result = updateTechnologySchema.safeParse({ id: -1, name: 'Next.js' });

      expect(result.success).toBe(false);
      if (result.success) throw new Error('Validation should failed');

      expect(result.error.flatten().fieldErrors.id).toBeDefined();
    });
  });

  // ## Array of technologies ids ##
  describe('technologyIdsSchema', () => {
    it('should accept valid array of IDs', () => {
      const validIds = [1, 2, 100];
      const result = technologyIdsSchema.safeParse(validIds);
      expect(result.success).toBe(true);
    });

    it('should accept empty array', () => {
      const result = technologyIdsSchema.safeParse([]);
      expect(result.success).toBe(true);
    });

    it('should accept undefined (optional)', () => {
      const result = technologyIdsSchema.safeParse(undefined);
      expect(result.success).toBe(true);
    });

    it('should fail if array contains non-numbers', () => {
      // we are not using coerce() here so we need to test it
      const invalidIds = [1, '2', 3];
      const result = technologyIdsSchema.safeParse(invalidIds);
      expect(result.success).toBe(false);
    });

    it('should fail if array contains negative numbers', () => {
      const invalidIds = [1, -5];
      const result = technologyIdsSchema.safeParse(invalidIds);

      expect(result.success).toBe(false);
      if (result.success) throw new Error('Should fail');

      expect(result.error.format()[1]?._errors).toContain(
        'ID technologii musi być dodatnią liczbą całkowitą',
      );
    });
  });
});
