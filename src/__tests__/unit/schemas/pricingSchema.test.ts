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
    console.error('Validation should have passed:', result.error);
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
        subtotal_net: 5000,
        discount: 500,
        total_net: 4500,
        total_cost: 3000,
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
        subtotal_net: '7500.50',
        discount: '500.25',
        total_net: '6999.75',
        total_cost: '4500',
        pricingHistoryId: '2',
      };
      const result = newPricingServiceSchema.safeParse(inputData);

      expect(result.success).toBe(true);
      assertValidationSuccess(result);

      expect(typeof result.data.subtotal_net).toBe('number');
      expect(result.data.subtotal_net).toBe(7500.5);
      expect(typeof result.data.discount).toBe('number');
      expect(result.data.discount).toBe(500.25);
      expect(typeof result.data.pricingHistoryId).toBe('number');
      expect(result.data.pricingHistoryId).toBe(2);
    });

    it('should fail when name is empty', () => {
      const invalidData = {
        name: '',
        subtotal_net: 1000,
        total_net: 1200,
        total_cost: 800,
        pricingHistoryId: 1,
      };
      const result = newPricingServiceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      assertValidationFailure(result);
      expect(result.error.flatten().fieldErrors.name).toContain('Nazwa usługi nie może być pusta');
    });

    it('should fail when subtotal_net is negative', () => {
      const invalidData = {
        name: 'Test usługi',
        subtotal_net: -100,
        total_net: 1200,
        total_cost: 800,
        pricingHistoryId: 1,
      };
      const result = newPricingServiceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should handle optional fields correctly', () => {
      const minimalData = {
        name: 'Minimalna usługa',
        subtotal_net: 1000,
        total_net: 1200,
        total_cost: 800,
        pricingHistoryId: 1,
      };
      const result = newPricingServiceSchema.safeParse(minimalData);

      expect(result.success).toBe(true);
      assertValidationSuccess(result);

      expect(result.data.discount).toBe(0);
      expect(result.data.description).toBeUndefined();
    });

    it('should treat invalid string numbers as errors', () => {
      const invalidData = {
        name: 'Test usługi',
        subtotal_net: 'nie-liczba',
        total_net: 1200,
        total_cost: 800,
        pricingHistoryId: 1,
      };
      const result = newPricingServiceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should allow zero values for cost and discount', () => {
      const validData = {
        name: 'Usługa z zerowymi wartościami',
        subtotal_net: 1000,
        discount: 0,
        total_net: 1000,
        total_cost: 0,
        pricingHistoryId: 1,
      };
      const result = newPricingServiceSchema.safeParse(validData);
      expect(result.success).toBe(true);
      assertValidationSuccess(result);
    });
  });

  // ### Validate update of pricing service ###
  describe('updatePricingServiceSchema', () => {
    it('should validate partial update with ID', () => {
      const updateData = {
        id: 10,
        name: 'Zaktualizowana nazwa',
        discount: 300,
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
        unit: 'h',
        quantity: 40,
        unit_price: 150,
        unit_cost: 100,
        pricingServiceId: 3,
      };
      const result = newPricingServiceResourceSchema.safeParse(validData);
      expect(result.success).toBe(true);
      assertValidationSuccess(result);
      expect(result.data.label).toBe('Programista senior');
    });

    it('should set default unit to "h" when not provided', () => {
      const dataWithoutUnit = {
        label: 'Test zasób',
        quantity: 10,
        unit_price: 100,
        unit_cost: 80,
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
        quantity: 10,
        unit_price: 100,
        unit_cost: 80,
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
        quantity: '20.5',
        unit_price: '120.50',
        unit_cost: '80.25',
        pricingServiceId: '5',
      };
      const result = newPricingServiceResourceSchema.safeParse(stringData);

      expect(result.success).toBe(true);
      assertValidationSuccess(result);

      expect(typeof result.data.quantity).toBe('number');
      expect(result.data.quantity).toBe(20.5);
      expect(typeof result.data.unit_price).toBe('number');
      expect(result.data.unit_price).toBe(120.5);
      expect(typeof result.data.pricingServiceId).toBe('number');
      expect(result.data.pricingServiceId).toBe(5);
    });

    it('should allow zero unit_cost', () => {
      const validData = {
        label: 'Zasób z zerowym kosztem',
        quantity: 10,
        unit_price: 100,
        unit_cost: 0,
        pricingServiceId: 1,
      };
      const result = newPricingServiceResourceSchema.safeParse(validData);
      expect(result.success).toBe(true);
      assertValidationSuccess(result);
      expect(result.data.unit_cost).toBe(0);
    });
  });

  // ### Validate update of pricing service resource ###
  describe('updatePricingServiceResourceSchema', () => {
    it('should validate partial update with ID', () => {
      const updateData = {
        id: 25,
        label: 'Zaktualizowana etykieta',
        quantity: 30,
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
        subtotal_net: 10000,
        discount: 1000,
        total_net: 9000,
        total_cost: 6000,
        pricingHistoryId: 3,
        resources: [
          {
            label: 'Programista',
            quantity: 40,
            unit_price: 150,
            unit_cost: 100,
          },
          {
            label: 'Designer',
            quantity: 20,
            unit_price: 120,
            unit_cost: 80,
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
        subtotal_net: 5000,
        discount: 0,
        total_net: 5000,
        total_cost: 0,
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
        subtotal_net: 1000,
        total_net: 1200,
        total_cost: 800,
        pricingHistoryId: 1,
        resources: [
          {
            label: '', // empty label
            quantity: 10,
            unit_price: 100,
            unit_cost: 80,
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
            quantity: 15,
            unit_price: 200,
            unit_cost: 150,
          },
          // Existing resource (with ID)
          {
            id: 5,
            label: 'Zaktualizowany istniejący zasób',
            quantity: 25,
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
    it('should handle non-numeric string in subtotal_net transform', () => {
      const invalidData = {
        name: 'Test usługi',
        subtotal_net: 'abc123',
        total_net: 1200,
        total_cost: 800,
        pricingHistoryId: 1,
      };
      const result = newPricingServiceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      assertValidationFailure(result);
    });

    it('should handle empty string in discount transform', () => {
      const data = {
        name: 'Test usługi',
        subtotal_net: 1000,
        total_net: 1200,
        total_cost: 800,
        pricingHistoryId: 1,
        discount: '',
      };
      const result = newPricingServiceSchema.safeParse(data);
      expect(result.success).toBe(true);
      assertValidationSuccess(result);
      expect(result.data.discount).toBe(0);
    });

    it('should handle invalid string in discount transform', () => {
      const data = {
        name: 'Test usługi',
        subtotal_net: 1000,
        total_net: 1200,
        total_cost: 800,
        pricingHistoryId: 1,
        discount: 'nie-liczba',
      };
      const result = newPricingServiceSchema.safeParse(data);
      expect(result.success).toBe(true);
      assertValidationSuccess(result);
      expect(result.data.discount).toBe(0);
    });

    it('should handle null in discount transform', () => {
      const data = {
        name: 'Test usługi',
        subtotal_net: 1000,
        total_net: 1200,
        total_cost: 800,
        pricingHistoryId: 1,
        discount: null,
      };
      const result = newPricingServiceSchema.safeParse(data);
      expect(result.success).toBe(true);
      assertValidationSuccess(result);
      expect(result.data.discount).toBe(0);
    });

    it('should handle undefined in discount transform', () => {
      const data = {
        name: 'Test usługi',
        subtotal_net: 1000,
        total_net: 1200,
        total_cost: 800,
        pricingHistoryId: 1,
      };
      const result = newPricingServiceSchema.safeParse(data);
      expect(result.success).toBe(true);
      assertValidationSuccess(result);
      expect(result.data.discount).toBe(0);
    });

    it('should handle non-numeric string in pricingHistoryId transform', () => {
      const invalidData = {
        name: 'Test usługi',
        subtotal_net: 1000,
        total_net: 1200,
        total_cost: 800,
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
        quantity: 10,
        unit_price: 100,
        unit_cost: 80,
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
        quantity: 10,
        unit_price: 100,
        unit_cost: 80,
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
        quantity: 10,
        unit_price: 100,
        unit_cost: 80,
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
        quantity: 10,
        unit_price: 100,
        unit_cost: 80,
        pricingServiceId: 1,
        positionId: 0,
      };
      const result = newPricingServiceResourceSchema.safeParse(data);
      expect(result.success).toBe(true);
      assertValidationSuccess(result);
      expect(result.data.positionId).toBeNull();
    });

    it('should handle invalid string in unit_price transform', () => {
      const data = {
        label: 'Test zasób',
        quantity: 10,
        unit_price: 'abc',
        unit_cost: 80,
        pricingServiceId: 1,
      };
      const result = newPricingServiceResourceSchema.safeParse(data);
      expect(result.success).toBe(false);
      assertValidationFailure(result);
    });

    it('should handle invalid string in quantity transform', () => {
      const data = {
        label: 'Test zasób',
        quantity: 'xyz',
        unit_price: 100,
        unit_cost: 80,
        pricingServiceId: 1,
      };
      const result = newPricingServiceResourceSchema.safeParse(data);
      expect(result.success).toBe(false);
      assertValidationFailure(result);
    });

    it('should handle invalid string in unit_cost transform', () => {
      const data = {
        label: 'Test zasób',
        quantity: 10,
        unit_price: 100,
        unit_cost: 'nie-liczba',
        pricingServiceId: 1,
      };
      const result = newPricingServiceResourceSchema.safeParse(data);
      expect(result.success).toBe(false);
      assertValidationFailure(result);
    });

    it('should handle invalid string in pricingServiceId transform', () => {
      const data = {
        label: 'Test zasób',
        quantity: 10,
        unit_price: 100,
        unit_cost: 80,
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
    // Test for empty string in subtotal_net
    it('should handle empty string in subtotal_net', () => {
      const invalidData = {
        name: 'Test usługi',
        subtotal_net: '',
        total_net: 1200,
        total_cost: 800,
        pricingHistoryId: 1,
      };
      const result = newPricingServiceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    // Test for empty string in total_net
    it('should handle empty string in total_net', () => {
      const invalidData = {
        name: 'Test usługi',
        subtotal_net: 1000,
        total_net: '',
        total_cost: 800,
        pricingHistoryId: 1,
      };
      const result = newPricingServiceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    // Test for empty string in total_cost
    it('should handle empty string in total_cost', () => {
      const invalidData = {
        name: 'Test usługi',
        subtotal_net: 1000,
        total_net: 1200,
        total_cost: '',
        pricingHistoryId: 1,
      };
      const result = newPricingServiceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    // Test for empty string in pricingHistoryId
    it('should handle empty string in pricingHistoryId', () => {
      const invalidData = {
        name: 'Test usługi',
        subtotal_net: 1000,
        total_net: 1200,
        total_cost: 800,
        pricingHistoryId: '',
      };
      const result = newPricingServiceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    // Test for string "0" in pricingHistoryId
    it('should handle string "0" in pricingHistoryId', () => {
      const invalidData = {
        name: 'Test usługi',
        subtotal_net: 1000,
        total_net: 1200,
        total_cost: 800,
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
        quantity: 10,
        unit_price: 100,
        unit_cost: 80,
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
        quantity: 10,
        unit_price: 100,
        unit_cost: 80,
        pricingServiceId: 1,
        positionId: '',
      };
      const result = newPricingServiceResourceSchema.safeParse(data);
      expect(result.success).toBe(true);
      assertValidationSuccess(result);
      expect(result.data.positionId).toBeNull();
    });

    // Test for invalid string in subtotal_net with proper error
    it('should handle invalid subtotal_net string with proper error', () => {
      const invalidData = {
        name: 'Test usługi',
        subtotal_net: 'abc',
        total_net: 1200,
        total_cost: 800,
        pricingHistoryId: 1,
      };
      const result = newPricingServiceSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      assertValidationFailure(result);

      const error = result.error.flatten();
      const errorMessages = [...error.formErrors, ...(error.fieldErrors.subtotal_net || [])];
      expect(errorMessages).toEqual(
        expect.arrayContaining([expect.stringContaining('Suma netto musi być nieujemną liczbą')]),
      );
    });

    // Test for invalid string in total_net
    it('should handle invalid total_net string with proper error', () => {
      const invalidData = {
        name: 'Test usługi',
        subtotal_net: 1000,
        total_net: 'xyz',
        total_cost: 800,
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
        subtotal_net: 1000,
        total_net: 1200,
        total_cost: 800,
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

    // Test for quantity zero should fail
    it('should fail when quantity is zero', () => {
      const invalidData = {
        label: 'Test zasób',
        quantity: 0,
        unit_price: 100,
        unit_cost: 80,
        pricingServiceId: 1,
      };
      const result = newPricingServiceResourceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    // Test for negative quantity should fail
    it('should fail when quantity is negative', () => {
      const invalidData = {
        label: 'Test zasób',
        quantity: -5,
        unit_price: 100,
        unit_cost: 80,
        pricingServiceId: 1,
      };
      const result = newPricingServiceResourceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
