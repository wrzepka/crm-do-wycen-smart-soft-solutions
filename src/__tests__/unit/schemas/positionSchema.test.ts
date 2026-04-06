import {
  newPositionSchema,
  updatePositionSchema,
  deletePositionSchema,
} from '@/lib/schemas/positionSchema';

describe('Position Schemas (Unit)', () => {
  describe('newPositionSchema', () => {
    it('should validate a correct position object with margin logic', () => {
      const validData = {
        name: 'Senior Developer',
        cost: 100,
        rate: 150,
      };
      const result = newPositionSchema.safeParse(validData);

      expect(result.success).toBe(true);

      if (!result.success) throw new Error('Validation failed unexpected');

      expect(result.data.cost).toBe(100);
      expect(result.data.rate).toBe(150);
    });

    it('should transform string numbers to numbers', () => {
      const inputData = {
        name: 'Designer',
        cost: '100.50',
        rate: '200.00',
      };
      const result = newPositionSchema.safeParse(inputData);

      expect(result.success).toBe(true);
      if (!result.success) throw new Error('Should parse successfully');

      expect(result.data.cost).toBe(100.5);
      expect(result.data.rate).toBe(200);
    });

    it('should use default 0 if fields are missing', () => {
      const inputData = {
        name: 'Intern',
      };
      const result = newPositionSchema.safeParse(inputData);

      expect(result.success).toBe(true);
      if (!result.success) throw new Error('Should parse successfully');

      expect(result.data.cost).toBe(0);
      expect(result.data.rate).toBe(0);
    });

    it('should fail when name is empty', () => {
      const invalidData = {
        name: '',
        cost: 0,
        rate: 0,
      };
      const result = newPositionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should fail when rate is lower than cost (negative margin)', () => {
      const invalidMarginData = {
        name: 'Unprofitable Position',
        cost: 200,
        rate: 100,
      };
      const result = newPositionSchema.safeParse(invalidMarginData);

      expect(result.success).toBe(false);

      if (result.success) throw new Error('Validation should have failed');

      const fieldErrors = result.error.flatten().fieldErrors;
      expect(fieldErrors.rate).toBeDefined();
      expect(fieldErrors.rate?.[0]).toContain('nie może być niższa');
    });

    it('should fail on invalid string (NaN)', () => {
      const inputData = {
        name: 'Tester',
        cost: 'abc',
        rate: 100,
      };

      const result = newPositionSchema.safeParse(inputData);
      expect(result.success).toBe(false);
    });
  });

  describe('updatePositionSchema', () => {
    it('should coerce string ID to number', () => {
      const stringIdUpdate = {
        id: '10',
        name: 'Coerced ID',
        cost: 50,
        rate: 60,
      };
      const result = updatePositionSchema.safeParse(stringIdUpdate);

      expect(result.success).toBe(true);
      if (!result.success) throw new Error('Should parse successfully');

      expect(result.data.id).toBe(10);
    });

    it('should validate margin logic also on update', () => {
      const invalidUpdate = {
        id: 1,
        name: 'Bad Update',
        cost: 500,
        rate: 100,
      };
      const result = updatePositionSchema.safeParse(invalidUpdate);
      expect(result.success).toBe(false);
    });
  });

  describe('deletePositionSchema', () => {
    it('should fail on negative ID', () => {
      const result = deletePositionSchema.safeParse({ id: -1 });
      expect(result.success).toBe(false);
    });

    it('should accept string ID and coerce it', () => {
      const result = deletePositionSchema.safeParse({ id: '123' });

      expect(result.success).toBe(true);
      if (!result.success) throw new Error('Should parse successfully');

      expect(result.data.id).toBe(123);
    });
  });
});
