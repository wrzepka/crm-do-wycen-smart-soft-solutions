import {
  newEmployeeSchema,
  updateEmployeeSchema,
  technologySelectionSchema,
} from '@/lib/schemas/employeeSchema';

describe('Employee schemas (Unit)', () => {
  // ### Validate creation of employee ###
  describe('newEmployeeSchema', () => {
    it('should validate a correct new employee', () => {
      const validData = {
        first_name: 'Jan',
        last_name: 'Kowalski',
        status: 'ACTIVE_AVAILABLE',
        technologyIds: [1, 2], // optional
        position_id: 5,
      };

      const result = newEmployeeSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should apply default status if missing', () => {
      const dataWithoutStatus = {
        first_name: 'Adam',
        last_name: 'Nowak',
      };

      const result = newEmployeeSchema.safeParse(dataWithoutStatus);

      expect(result.success).toBe(true);
      if (!result.success) throw new Error('Validation should passed');

      expect(result.data.status).toBe('ACTIVE_AVAILABLE');
    });

    it('should fail on invalid enum value for status', () => {
      const invalidData = {
        first_name: 'Jan',
        last_name: 'Test',
        status: 'FIRED_BUT_HAPPY',
      };

      const result = newEmployeeSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (result.success) throw new Error('Validation should fail');

      expect(result.error.flatten().fieldErrors.status).toBeDefined();
    });

    it('should fail when name is empty', () => {
      const invalidData = {
        first_name: '',
        last_name: 'Kowalski',
      };
      const result = newEmployeeSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should validate Date objects for busy_from', () => {
      const validData = {
        first_name: 'Jan',
        last_name: 'Test',
        busy_from: new Date(),
        busy_to: new Date(),
      };

      const result = newEmployeeSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should fail if date is passed as string without coercion', () => {
      const invalidData = {
        first_name: 'Jan',
        last_name: 'Test',
        busy_from: '2024-01-01', // String instead of new Date()
      };

      const result = newEmployeeSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  // ### Validate update of employee ###
  describe('updateEmployeeSchema', () => {
    it('should require ID for update', () => {
      const noIdData = {
        first_name: 'New Name',
      };

      const result = updateEmployeeSchema.safeParse(noIdData);
      expect(result.success).toBe(false);
    });

    it('should allow partial update (e.g. only status)', () => {
      const partialData = {
        id: 10,
        status: 'ON_LEAVE',
      };

      const result = updateEmployeeSchema.safeParse(partialData);
      expect(result.success).toBe(true);
    });

    it('should allow clearing nullable fields (position_id)', () => {
      const nullData = {
        id: 10,
        position_id: null,
        busy_from: null,
      };

      const result = updateEmployeeSchema.safeParse(nullData);

      expect(result.success).toBe(true);
      if (!result.success) throw new Error('Validation should passed');

      expect(result.data.position_id).toBeNull();
    });
  });

  // ### Validate technologies selection ###
  describe('technologySelectionSchema', () => {
    it('should validate a correct technology object', () => {
      const validData = { id: 1, name: 'React' };
      const result = technologySelectionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should fail on negative ID', () => {
      const result = technologySelectionSchema.safeParse({ id: -1, name: 'Java' });
      expect(result.success).toBe(false);
    });

    it('should fail on missing name', () => {
      const result = technologySelectionSchema.safeParse({ id: 1 });
      expect(result.success).toBe(false);
    });
  });
});
