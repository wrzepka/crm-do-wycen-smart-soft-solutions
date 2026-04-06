import { describe, it, expect } from '@jest/globals';
import {
  newPricingHistorySchema,
  updatePricingHistorySchema,
  createPricingHistoryWithServicesSchema,
  updatePricingHistoryWithServicesSchema,
  deletePricingHistorySchema,
} from '@/lib/schemas/pricingHistorySchema';

const mockServiceData = {
  service_id: 1,
  quantity: 1,
  resources: [],
};

describe('pricingHistorySchema (Unit)', () => {
  describe('newPricingHistorySchema', () => {
    it('should validate correct pricing history with minimal data', () => {
      const input = {
        client_id: 10,
      };

      const result = newPricingHistorySchema.safeParse(input);

      if (!result.success) {
        throw new Error(`Validation should pass.`);
      }

      expect(result.data.version).toBe(1);
      expect(result.data.currency).toBe('PLN');
      expect(result.data.status).toBe('DRAFT');
      expect(result.data.discount).toBe(0);
    });

    it('should transform string numbers to actual numbers (coercion)', () => {
      const input = {
        client_id: 10,
        discount: '15.5',
        vat_rate: '23',
      };

      const result = newPricingHistorySchema.safeParse(input);

      if (!result.success) {
        throw new Error(`Validation should pass.`);
      }

      expect(result.data.discount).toBe(15.5);
      expect(typeof result.data.discount).toBe('number');
      expect(result.data.vat_rate).toBe(23);
    });

    it('should fail when vat_rate is out of range (0-100)', () => {
      const input = {
        client_id: 10,
        vat_rate: 150,
      };

      const result = newPricingHistorySchema.safeParse(input);

      if (result.success) {
        throw new Error('Validation should fail.');
      }

      expect(result.error.issues[0].message).toContain('0-100%');
    });
  });

  describe('updatePricingHistorySchema', () => {
    it('should require ID for update', () => {
      const input = {
        notes: 'Aktualizacja notatki',
      };

      const result = updatePricingHistorySchema.safeParse(input);

      expect(result.success).toBe(false);
    });

    it('should allow partial updates', () => {
      const input = {
        id: 123,
        status: 'SENT',
      };

      const result = updatePricingHistorySchema.safeParse(input);

      if (!result.success) {
        throw new Error(result.error.message);
      }

      expect(result.data.id).toBe(123);
      expect(result.data.status).toBe('SENT');
    });
  });

  describe('createPricingHistoryWithServicesSchema', () => {
    it('should fail if services array is empty', () => {
      const input = {
        client_id: 5,
        services: [],
      };

      const result = createPricingHistoryWithServicesSchema.safeParse(input);

      if (result.success) {
        throw new Error('Validation should fail.');
      }

      expect(result.error.issues[0].message).toContain('co najmniej jedną usługę');
    });
  });

  describe('updatePricingHistoryWithServicesSchema', () => {
    it('should validate ID and services array presence', () => {
      const mockUpdateServiceData = {
        ...mockServiceData,
        id: 101,
        name: 'Usługa Testowa',
      };

      const input = {
        id: 99,
        services: [mockUpdateServiceData],
      };

      const result = updatePricingHistoryWithServicesSchema.safeParse(input);

      if (!result.success) {
        throw new Error(`Validation should pass.`);
      }

      expect(result.data.id).toBe(99);
      expect(result.data.services).toHaveLength(1);
    });
  });

  describe('deletePricingHistorySchema', () => {
    it('should validate positive ID', () => {
      const result = deletePricingHistorySchema.safeParse({ id: 50 });
      expect(result.success).toBe(true);
    });

    it('should fail on negative ID', () => {
      const result = deletePricingHistorySchema.safeParse({ id: -5 });
      expect(result.success).toBe(false);
    });
  });
});
