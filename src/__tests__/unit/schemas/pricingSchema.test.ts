import {
  newPricingServiceSchema,
  updatePricingServiceSchema,
  deletePricingServiceSchema,
  newPricingServiceResourceSchema,
  updatePricingServiceResourceSchema,
  deletePricingServiceResourceSchema,
  createPricingServiceWithResourcesSchema,
  updatePricingServiceWithResourcesSchema,
} from '@/lib/schemas/pricingSchema';

// Helper functions for type assertions
function assertValidationSuccess<T>(result: {
  success: boolean;
  data?: T;
  error?: any;
}): asserts result is { success: true; data: T } {
  if (!result.success) {
    throw new Error('Validation should have passed');
  }
}

function assertValidationFailure<T>(result: {
  success: boolean;
  data?: T;
  error?: any;
}): asserts result is { success: false; error: any } {
  if (result.success) {
    throw new Error('Validation should have failed');
  }
}

describe('Pricing Schemas (Unit)', () => {
  // ### Validate creation of pricing service ###
  describe('newPricingServiceSchema', () => {
    it('should validate a correct pricing service object', () => {
      const validData = {
        name: 'Strona internetowa',
        description: 'Strona firmowa z responsywnym designem',
        net_price: 5000,
        margin_amount: 1000,
        discount_amount: 500,
        total_price: 5500,
        pricingHistoryId: 1,
      };
      const result = newPricingServiceSchema.safeParse(validData);
      expect(result.success).toBe(true);
      assertValidationSuccess(result);
      expect(result.data.name).toBe('Strona internetowa');
    });

    it('should transform string values to numbers', () => {
      const inputData = {
        name: 'Aplikacja mobilna',
        net_price: '7500.50',
        margin_amount: '1500',
        discount_amount: '200.75',
        total_price: '8799.75',
        pricingHistoryId: '2',
      };
      const result = newPricingServiceSchema.safeParse(inputData);

      expect(result.success).toBe(true);
      assertValidationSuccess(result);

      expect(typeof result.data.net_price).toBe('number');
      expect(result.data.net_price).toBe(7500.5);
      expect(typeof result.data.margin_amount).toBe('number');
      expect(typeof result.data.pricingHistoryId).toBe('number');
      expect(result.data.pricingHistoryId).toBe(2);
    });

    it('should fail when name is empty', () => {
      const invalidData = {
        name: '',
        net_price: 1000,
        total_price: 1200,
        pricingHistoryId: 1,
      };
      const result = newPricingServiceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      assertValidationFailure(result);
      expect(result.error.flatten().fieldErrors.name).toContain('Nazwa usługi nie może być pusta');
    });

    it('should fail when net_price is negative', () => {
      const invalidData = {
        name: 'Test usługi',
        net_price: -100,
        total_price: 1200,
        pricingHistoryId: 1,
      };
      const result = newPricingServiceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should handle optional fields correctly', () => {
      const minimalData = {
        name: 'Minimalna usługa',
        net_price: 1000,
        total_price: 1200,
        pricingHistoryId: 1,
      };
      const result = newPricingServiceSchema.safeParse(minimalData);

      expect(result.success).toBe(true);
      assertValidationSuccess(result);

      expect(result.data.margin_amount).toBe(0);
      expect(result.data.discount_amount).toBeUndefined();
      expect(result.data.description).toBeUndefined();
    });

    it('should treat invalid string numbers as errors', () => {
      const invalidData = {
        name: 'Test usługi',
        net_price: 'nie-liczba',
        total_price: 1200,
        pricingHistoryId: 1,
      };
      const result = newPricingServiceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  // ### Validate update of pricing service ###
  describe('updatePricingServiceSchema', () => {
    it('should validate partial update with ID', () => {
      const updateData = {
        id: 10,
        name: 'Zaktualizowana nazwa',
        discount_amount: 300,
      };
      const result = updatePricingServiceSchema.safeParse(updateData);
      expect(result.success).toBe(true);
      assertValidationSuccess(result);
      expect(result.data.name).toBe('Zaktualizowana nazwa');
    });

    it('should coerce string ID to number', () => {
      const stringIdUpdate = {
        id: '15',
        name: 'Usługa z ID jako string',
      };
      const result = updatePricingServiceSchema.safeParse(stringIdUpdate);

      expect(result.success).toBe(true);
      assertValidationSuccess(result);
      expect(result.data.id).toBe(15);
    });

    it('should fail when ID is missing', () => {
      const noIdUpdate = {
        name: 'Brak ID',
      };
      const result = updatePricingServiceSchema.safeParse(noIdUpdate);
      expect(result.success).toBe(false);
    });

    it('should allow updating only some fields', () => {
      const partialUpdate = {
        id: 1,
        description: 'Nowy opis',
      };
      const result = updatePricingServiceSchema.safeParse(partialUpdate);
      expect(result.success).toBe(true);
      assertValidationSuccess(result);
      expect(result.data.description).toBe('Nowy opis');
    });
  });

  // ### Validate deletion of pricing service ###
  describe('deletePricingServiceSchema', () => {
    it('should validate deletion with positive ID', () => {
      const result = deletePricingServiceSchema.safeParse({ id: 5 });
      expect(result.success).toBe(true);
    });

    it('should fail on negative ID', () => {
      const result = deletePricingServiceSchema.safeParse({ id: -1 });
      expect(result.success).toBe(false);
    });

    it('should fail on zero ID', () => {
      const result = deletePricingServiceSchema.safeParse({ id: 0 });
      expect(result.success).toBe(false);
    });
  });

  // ### Validate creation of pricing service resource ###
  describe('newPricingServiceResourceSchema', () => {
    it('should validate a correct resource object', () => {
      const validData = {
        label: 'Programista senior',
        positionId: 1,
        unitPrice: 150,
        hours: 40,
        totalCost: 6000,
        pricingServiceId: 3,
      };
      const result = newPricingServiceResourceSchema.safeParse(validData);
      expect(result.success).toBe(true);
      assertValidationSuccess(result);
      expect(result.data.label).toBe('Programista senior');
    });

    it('should set default unit to "h"', () => {
      const dataWithoutUnit = {
        label: 'Test zasób',
        unitPrice: 100,
        hours: 10,
        totalCost: 1000,
        pricingServiceId: 1,
      };
      const result = newPricingServiceResourceSchema.safeParse(dataWithoutUnit);

      expect(result.success).toBe(true);
      assertValidationSuccess(result);
      expect(result.data.unit).toBe('h');
    });

    it('should handle nullable positionId correctly', () => {
      const dataWithoutPosition = {
        label: 'Zasób bez pozycji',
        unitPrice: 100,
        hours: 10,
        totalCost: 1000,
        pricingServiceId: 1,
        positionId: null,
      };
      const result = newPricingServiceResourceSchema.safeParse(dataWithoutPosition);
      expect(result.success).toBe(true);
      assertValidationSuccess(result);
      expect(result.data.positionId).toBeNull();
    });

    it('should transform string values to numbers', () => {
      const stringData = {
        label: 'Test',
        unitPrice: '120.50',
        hours: '20.5',
        totalCost: '2470.25',
        pricingServiceId: '5',
      };
      const result = newPricingServiceResourceSchema.safeParse(stringData);

      expect(result.success).toBe(true);
      assertValidationSuccess(result);

      expect(typeof result.data.unitPrice).toBe('number');
      expect(result.data.unitPrice).toBe(120.5);
      expect(typeof result.data.pricingServiceId).toBe('number');
      expect(result.data.pricingServiceId).toBe(5);
    });
  });

  // ### Validate update of pricing service resource ###
  describe('updatePricingServiceResourceSchema', () => {
    it('should validate partial update with ID', () => {
      const updateData = {
        id: 25,
        label: 'Zaktualizowana etykieta',
        hours: 30,
      };
      const result = updatePricingServiceResourceSchema.safeParse(updateData);
      expect(result.success).toBe(true);
      assertValidationSuccess(result);
      expect(result.data.label).toBe('Zaktualizowana etykieta');
    });

    it('should require ID for update', () => {
      const noIdUpdate = {
        label: 'Brak ID',
      };
      const result = updatePricingServiceResourceSchema.safeParse(noIdUpdate);
      expect(result.success).toBe(false);
    });
  });

  // ### Validate deletion of pricing service resource ###
  describe('deletePricingServiceResourceSchema', () => {
    it('should validate deletion with positive ID', () => {
      const result = deletePricingServiceResourceSchema.safeParse({ id: 100 });
      expect(result.success).toBe(true);
    });

    it('should fail on invalid ID', () => {
      const result = deletePricingServiceResourceSchema.safeParse({ id: 0 });
      expect(result.success).toBe(false);
    });
  });

  // ### Validate creation of pricing service with resources ###
  describe('createPricingServiceWithResourcesSchema', () => {
    it('should validate service with multiple resources', () => {
      const validData = {
        name: 'Kompleksowy projekt',
        net_price: 10000,
        total_price: 12000,
        pricingHistoryId: 3,
        resources: [
          {
            label: 'Programista',
            unitPrice: 150,
            hours: 40,
            totalCost: 6000,
          },
          {
            label: 'Designer',
            unitPrice: 120,
            hours: 20,
            totalCost: 2400,
          },
        ],
      };
      const result = createPricingServiceWithResourcesSchema.safeParse(validData);
      expect(result.success).toBe(true);
      assertValidationSuccess(result);
      expect(result.data.resources).toHaveLength(2);
    });

    it('should handle service without resources', () => {
      const dataWithoutResources = {
        name: 'Usługa bez zasobów',
        net_price: 5000,
        total_price: 6000,
        pricingHistoryId: 1,
      };
      const result = createPricingServiceWithResourcesSchema.safeParse(dataWithoutResources);

      expect(result.success).toBe(true);
      assertValidationSuccess(result);
      expect(result.data.resources).toEqual([]);
    });

    it('should fail if resources have invalid data', () => {
      const invalidData = {
        name: 'Test',
        net_price: 1000,
        total_price: 1200,
        pricingHistoryId: 1,
        resources: [
          {
            label: '', // empty label
            unitPrice: 100,
            hours: 10,
            totalCost: 1000,
          },
        ],
      };
      const result = createPricingServiceWithResourcesSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  // ### Validate update of pricing service with resources ###
  describe('updatePricingServiceWithResourcesSchema', () => {
    it('should validate update with both new and existing resources', () => {
      const updateData = {
        id: 10,
        name: 'Zaktualizowana usługa',
        resources: [
          // New resource (without ID)
          {
            label: 'Nowy zasób',
            unitPrice: 200,
            hours: 15,
            totalCost: 3000,
          },
          // Existing resource (with ID)
          {
            id: 5,
            label: 'Zaktualizowany istniejący zasób',
            hours: 25,
          },
        ],
      };
      const result = updatePricingServiceWithResourcesSchema.safeParse(updateData);
      expect(result.success).toBe(true);
      assertValidationSuccess(result);
      expect(result.data.resources).toHaveLength(2);
    });

    it('should handle partial update without resources', () => {
      const partialUpdate = {
        id: 1,
        description: 'Tylko aktualizacja opisu',
      };
      const result = updatePricingServiceWithResourcesSchema.safeParse(partialUpdate);
      expect(result.success).toBe(true);
      assertValidationSuccess(result);
      expect(result.data.description).toBe('Tylko aktualizacja opisu');
    });
  });

  // ### Edge Cases in Pricing Schemas ###
  describe('Edge Cases - Transform Methods', () => {
    // Tests for transformation in newPricingServiceSchema
    it('should handle non-numeric string in net_price transform', () => {
      const invalidData = {
        name: 'Test usługi',
        net_price: 'abc123',
        total_price: 1200,
        pricingHistoryId: 1,
      };
      const result = newPricingServiceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      assertValidationFailure(result);
    });

    it('should handle empty string in margin_amount transform', () => {
      const data = {
        name: 'Test usługi',
        net_price: 1000,
        total_price: 1200,
        pricingHistoryId: 1,
        margin_amount: '',
      };
      const result = newPricingServiceSchema.safeParse(data);
      expect(result.success).toBe(true);
      assertValidationSuccess(result);
      expect(result.data.margin_amount).toBe(0);
    });

    it('should handle invalid string in margin_amount transform', () => {
      const data = {
        name: 'Test usługi',
        net_price: 1000,
        total_price: 1200,
        pricingHistoryId: 1,
        margin_amount: 'nie-liczba',
      };
      const result = newPricingServiceSchema.safeParse(data);
      expect(result.success).toBe(true);
      assertValidationSuccess(result);
      expect(result.data.margin_amount).toBe(0);
    });

    it('should handle null in margin_amount transform', () => {
      const data = {
        name: 'Test usługi',
        net_price: 1000,
        total_price: 1200,
        pricingHistoryId: 1,
        margin_amount: null,
      };
      const result = newPricingServiceSchema.safeParse(data);
      expect(result.success).toBe(true);
      assertValidationSuccess(result);
      expect(result.data.margin_amount).toBe(0);
    });

    it('should handle undefined in margin_amount transform', () => {
      const data = {
        name: 'Test usługi',
        net_price: 1000,
        total_price: 1200,
        pricingHistoryId: 1,
      };
      const result = newPricingServiceSchema.safeParse(data);
      expect(result.success).toBe(true);
      assertValidationSuccess(result);
      expect(result.data.margin_amount).toBe(0);
    });

    it('should handle invalid string in discount_amount transform', () => {
      const data = {
        name: 'Test usługi',
        net_price: 1000,
        total_price: 1200,
        pricingHistoryId: 1,
        discount_amount: 'nie-liczba',
      };
      const result = newPricingServiceSchema.safeParse(data);
      expect(result.success).toBe(true);
      assertValidationSuccess(result);
      expect(result.data.discount_amount).toBeNull();
    });

    it('should handle undefined in discount_amount transform', () => {
      const data = {
        name: 'Test usługi',
        net_price: 1000,
        total_price: 1200,
        pricingHistoryId: 1,
      };
      const result = newPricingServiceSchema.safeParse(data);
      expect(result.success).toBe(true);
      assertValidationSuccess(result);
      expect(result.data.discount_amount).toBeUndefined();
    });

    it('should handle non-numeric string in pricingHistoryId transform', () => {
      const invalidData = {
        name: 'Test usługi',
        net_price: 1000,
        total_price: 1200,
        pricingHistoryId: 'abc123',
      };
      const result = newPricingServiceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      assertValidationFailure(result);
    });

    // Tests for transformation in newPricingServiceResourceSchema
    it('should handle undefined in positionId transform', () => {
      const data = {
        label: 'Test zasób',
        unitPrice: 100,
        hours: 10,
        totalCost: 1000,
        pricingServiceId: 1,
      };
      const result = newPricingServiceResourceSchema.safeParse(data);
      expect(result.success).toBe(true);
      assertValidationSuccess(result);
      expect(result.data.positionId).toBeUndefined();
    });

    it('should handle null in positionId transform', () => {
      const data = {
        label: 'Test zasób',
        unitPrice: 100,
        hours: 10,
        totalCost: 1000,
        pricingServiceId: 1,
        positionId: null,
      };
      const result = newPricingServiceResourceSchema.safeParse(data);
      expect(result.success).toBe(true);
      assertValidationSuccess(result);
      expect(result.data.positionId).toBeNull();
    });

    it('should handle negative number in positionId transform', () => {
      const data = {
        label: 'Test zasób',
        unitPrice: 100,
        hours: 10,
        totalCost: 1000,
        pricingServiceId: 1,
        positionId: -5,
      };
      const result = newPricingServiceResourceSchema.safeParse(data);
      expect(result.success).toBe(true);
      assertValidationSuccess(result);
      expect(result.data.positionId).toBeNull();
    });

    it('should handle zero in positionId transform', () => {
      const data = {
        label: 'Test zasób',
        unitPrice: 100,
        hours: 10,
        totalCost: 1000,
        pricingServiceId: 1,
        positionId: 0,
      };
      const result = newPricingServiceResourceSchema.safeParse(data);
      expect(result.success).toBe(true);
      assertValidationSuccess(result);
      expect(result.data.positionId).toBeNull();
    });

    it('should handle invalid string in unitPrice transform', () => {
      const data = {
        label: 'Test zasób',
        unitPrice: 'abc',
        hours: 10,
        totalCost: 1000,
        pricingServiceId: 1,
      };
      const result = newPricingServiceResourceSchema.safeParse(data);
      expect(result.success).toBe(false);
      assertValidationFailure(result);
    });

    it('should handle invalid string in hours transform', () => {
      const data = {
        label: 'Test zasób',
        unitPrice: 100,
        hours: 'xyz',
        totalCost: 1000,
        pricingServiceId: 1,
      };
      const result = newPricingServiceResourceSchema.safeParse(data);
      expect(result.success).toBe(false);
      assertValidationFailure(result);
    });

    it('should handle invalid string in totalCost transform', () => {
      const data = {
        label: 'Test zasób',
        unitPrice: 100,
        hours: 10,
        totalCost: 'nie-liczba',
        pricingServiceId: 1,
      };
      const result = newPricingServiceResourceSchema.safeParse(data);
      expect(result.success).toBe(false);
      assertValidationFailure(result);
    });

    it('should handle invalid string in pricingServiceId transform', () => {
      const data = {
        label: 'Test zasób',
        unitPrice: 100,
        hours: 10,
        totalCost: 1000,
        pricingServiceId: 'abc123',
      };
      const result = newPricingServiceResourceSchema.safeParse(data);
      expect(result.success).toBe(false);
      assertValidationFailure(result);
    });

    // Tests for transformation in update schemas
    it('should handle invalid string in update ID transform', () => {
      const updateData = {
        id: 'abc123',
        label: 'Zaktualizowana etykieta',
      };
      const result = updatePricingServiceResourceSchema.safeParse(updateData);
      expect(result.success).toBe(false);
      assertValidationFailure(result);
    });

    it('should handle empty string in update ID transform', () => {
      const updateData = {
        id: '',
        label: 'Zaktualizowana etykieta',
      };
      const result = updatePricingServiceResourceSchema.safeParse(updateData);
      expect(result.success).toBe(false);
      assertValidationFailure(result);
    });

    it('should handle zero string in update ID transform', () => {
      const updateData = {
        id: '0',
        label: 'Zaktualizowana etykieta',
      };
      const result = updatePricingServiceResourceSchema.safeParse(updateData);
      expect(result.success).toBe(false);
      assertValidationFailure(result);
    });
  });

  // ### Additional Coverage Tests ###
  describe('Additional Coverage Tests', () => {
    // Test for empty string in net_price
    it('should handle empty string in net_price', () => {
      const invalidData = {
        name: 'Test usługi',
        net_price: '',
        total_price: 1200,
        pricingHistoryId: 1,
      };
      const result = newPricingServiceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    // Test for empty string in total_price
    it('should handle empty string in total_price', () => {
      const invalidData = {
        name: 'Test usługi',
        net_price: 1000,
        total_price: '',
        pricingHistoryId: 1,
      };
      const result = newPricingServiceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    // Test for empty string in pricingHistoryId
    it('should handle empty string in pricingHistoryId', () => {
      const invalidData = {
        name: 'Test usługi',
        net_price: 1000,
        total_price: 1200,
        pricingHistoryId: '',
      };
      const result = newPricingServiceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    // Test for string "0" in pricingHistoryId
    it('should handle string "0" in pricingHistoryId', () => {
      const invalidData = {
        name: 'Test usługi',
        net_price: 1000,
        total_price: 1200,
        pricingHistoryId: '0',
      };
      const result = newPricingServiceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    // Test for update with empty string ID
    it('should handle empty string ID in update', () => {
      const invalidUpdate = {
        id: '',
        name: 'Test',
      };
      const result = updatePricingServiceSchema.safeParse(invalidUpdate);
      expect(result.success).toBe(false);
    });

    // Test for resource update with empty string ID
    it('should handle empty string ID in resource update', () => {
      const invalidUpdate = {
        id: '',
        label: 'Test',
      };
      const result = updatePricingServiceResourceSchema.safeParse(invalidUpdate);
      expect(result.success).toBe(false);
    });

    // Test for position with string "0"
    it('should handle string "0" in positionId', () => {
      const data = {
        label: 'Test zasób',
        unitPrice: 100,
        hours: 10,
        totalCost: 1000,
        pricingServiceId: 1,
        positionId: '0',
      };
      const result = newPricingServiceResourceSchema.safeParse(data);
      expect(result.success).toBe(true);
      assertValidationSuccess(result);
      expect(result.data.positionId).toBeNull();
    });

    // Test for position with empty string
    it('should handle empty string in positionId', () => {
      const data = {
        label: 'Test zasób',
        unitPrice: 100,
        hours: 10,
        totalCost: 1000,
        pricingServiceId: 1,
        positionId: '',
      };
      const result = newPricingServiceResourceSchema.safeParse(data);
      expect(result.success).toBe(true);
      assertValidationSuccess(result);
      expect(result.data.positionId).toBeNull();
    });

    // Test for invalid string in net_price with proper error
    it('should handle invalid net_price string with proper error', () => {
      const invalidData = {
        name: 'Test usługi',
        net_price: 'abc',
        total_price: 1200,
        pricingHistoryId: 1,
      };
      const result = newPricingServiceSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      assertValidationFailure(result);

      const error = result.error.flatten();
      // Combine errors from formErrors and fieldErrors.net_price
      const errorMessages = [...error.formErrors, ...(error.fieldErrors.net_price || [])];
      expect(errorMessages).toEqual(
        expect.arrayContaining([expect.stringContaining('Cena netto musi być dodatnią liczbą')]),
      );
    });

    // Test for invalid string in total_price
    it('should handle invalid total_price string with proper error', () => {
      const invalidData = {
        name: 'Test usługi',
        net_price: 1000,
        total_price: 'xyz',
        pricingHistoryId: 1,
      };
      const result = newPricingServiceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      assertValidationFailure(result);
    });

    // Test for invalid string in pricingHistoryId
    it('should handle invalid pricingHistoryId string with proper error', () => {
      const invalidData = {
        name: 'Test usługi',
        net_price: 1000,
        total_price: 1200,
        pricingHistoryId: 'abc',
      };
      const result = newPricingServiceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      assertValidationFailure(result);
    });

    // Test for invalid string in update ID
    it('should handle invalid ID string in update', () => {
      const invalidUpdate = {
        id: 'nie-liczba',
        name: 'Test',
      };
      const result = updatePricingServiceSchema.safeParse(invalidUpdate);
      expect(result.success).toBe(false);
      assertValidationFailure(result);
    });

    // Test for invalid string in resource update ID
    it('should handle invalid ID string in resource update', () => {
      const invalidUpdate = {
        id: 'nie-liczba',
        label: 'Test',
      };
      const result = updatePricingServiceResourceSchema.safeParse(invalidUpdate);
      expect(result.success).toBe(false);
      assertValidationFailure(result);
    });
  });
});
