import {
  newPositionSchema,
  updatePositionSchema,
  deletePositionSchema,
} from '@/lib/schemas/positionSchema';

describe('Position Schemas (Unit)', () => {
  // ### Validate creation of position ###
  describe('newPositionSchema', () => {
    it('should validate a correct position object', () => {
      const validData = {
        name: 'Senior Developer',
        hourly_rate: 200,
      };
      const result = newPositionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should transform string hourly_rate to number', () => {
      const inputData = {
        name: 'Designer',
        hourly_rate: '150.50',
      };
      const result = newPositionSchema.safeParse(inputData);

      expect(result.success).toBe(true);
      if (!result.success) throw new Error('Validation should passed');

      expect(result.data.hourly_rate).toBe(150.5);
    });

    it('should fail when name is empty', () => {
      const invalidData = {
        name: '',
        hourly_rate: 100,
      };
      const result = newPositionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should treat invalid string number as null', () => {
      const inputData = {
        name: 'Tester',
        hourly_rate: 'abc',
      };

      const result = newPositionSchema.safeParse(inputData);

      expect(result.success).toBe(true);
      if (!result.success) throw new Error('Validation should passed');

      expect(result.data.hourly_rate).toBeNull();
    });
  });

  // ### Validate update of position ###
  describe('updatePositionSchema', () => {
    it('should coerce string ID to number', () => {
      const stringIdUpdate = {
        id: '10',
        name: 'Coerced ID',
      };
      const result = updatePositionSchema.safeParse(stringIdUpdate);

      expect(result.success).toBe(true);
      if (!result.success) throw new Error('Validation should passed');

      expect(result.data.id).toBe(10);
    });
  });

  // ### Validate deletion of position ###
  describe('deletePositionSchema', () => {
    it('should fail on negative ID', () => {
      const result = deletePositionSchema.safeParse({ id: -1 });
      expect(result.success).toBe(false);
    });
  });
});
