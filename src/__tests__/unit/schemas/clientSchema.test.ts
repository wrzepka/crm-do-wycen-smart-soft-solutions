import {
  clientAddressBaseSchema,
  newClientSchema,
  updateClientSchema,
  newClientWithAddressSchema,
} from '@/lib/schemas/clientSchema';

describe('Client Schemas (Unit)', () => {
  // ### Address and NIP validation ###
  describe('clientAddressBaseSchema', () => {
    const validNip = '5261040828';

    it('should validate a correct address object', () => {
      const validData = {
        city: 'Warszawa',
        postal_code: '00-001',
        street: 'Marszałkowska',
        building_number: '10/20',
        nip: validNip,
      };

      const result = clientAddressBaseSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should fail on invalid NIP checksum', () => {
      const invalidNipData = {
        city: 'Warszawa',
        postal_code: '00-001',
        street: 'Testowa',
        building_number: '1',
        nip: '1234567890', // checksum is wrong
      };

      const result = clientAddressBaseSchema.safeParse(invalidNipData);

      expect(result.success).toBe(false);
      if (result.success) throw new Error('Validation should failed');

      expect(result.error.flatten().fieldErrors.nip).toContain(
        'Nieprawidłowy numer NIP (błąd sumy kontrolnej)',
      );
    });

    it('should fail on wrong NIP length', () => {
      const shortNip = {
        city: 'Kraków',
        postal_code: '30-001',
        street: 'Test',
        building_number: '1',
        nip: '526104082', // 9 digits
      };

      const result = clientAddressBaseSchema.safeParse(shortNip);
      expect(result.success).toBe(false);
    });

    it('should validate correct postal code format', () => {
      const validData = {
        city: 'Wrocław',
        postal_code: '50-100',
        street: 'Rynek',
        building_number: '1',
        nip: validNip,
      };

      const result = clientAddressBaseSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should fail on invalid postal code format', () => {
      const invalidCodes = ['50100', '50-1', '50-1000', 'ab-cde'];

      invalidCodes.forEach((code) => {
        const result = clientAddressBaseSchema.safeParse({
          city: 'City',
          postal_code: code,
          street: 'St',
          building_number: '1',
          nip: validNip,
        });
        expect(result.success).toBe(false);
      });
    });

    it('should allow Polish characters in city and street', () => {
      const polishData = {
        city: 'Łódź',
        postal_code: '90-001',
        street: 'Aleja Kościuszki',
        building_number: '1',
        nip: validNip,
      };

      const result = clientAddressBaseSchema.safeParse(polishData);
      expect(result.success).toBe(true);
    });
  });

  // ### Client data validation ###
  describe('newClientSchema', () => {
    it('should validate a correct new client', () => {
      const validClient = {
        first_name: 'Jan',
        last_name: 'Kowalski',
        email: 'jan@example.com',
        is_lead: true,
        phone: '123-456-789',
      };

      const result = newClientSchema.safeParse(validClient);
      expect(result.success).toBe(true);
    });

    it('should transform email to lowercase', () => {
      const upperEmailClient = {
        first_name: 'Jan',
        last_name: 'Kowalski',
        email: 'JAN@EXAMPLE.COM',
        is_lead: false,
      };

      const result = newClientSchema.safeParse(upperEmailClient);

      expect(result.success).toBe(true);
      if (!result.success) throw new Error('Validation should pass');

      expect(result.data.email).toBe('jan@example.com');
    });

    it('should allow empty string, null or undefined for phone', () => {
      const baseClient = {
        first_name: 'Anna',
        last_name: 'Nowak',
        email: 'anna@example.com',
        is_lead: true,
      };

      // Case 1: Empty string
      const resEmpty = newClientSchema.safeParse({ ...baseClient, phone: '' });
      expect(resEmpty.success).toBe(true);

      // Case 2: Null
      const resNull = newClientSchema.safeParse({ ...baseClient, phone: null });
      expect(resNull.success).toBe(true);

      // Case 3: Undefined (optional)
      const resUndefined = newClientSchema.safeParse({ ...baseClient });
      expect(resUndefined.success).toBe(true);
    });

    it('should fail when is_lead is missing', () => {
      const missingLead = {
        first_name: 'Piotr',
        last_name: 'Zieliński',
        email: 'piotr@example.com',
        // is_lead is missing
      };

      const result = newClientSchema.safeParse(missingLead);
      expect(result.success).toBe(false);
    });
  });

  // ### Update validation ###
  describe('updateClientSchema', () => {
    it('should require ID for update', () => {
      const noIdUpdate = {
        first_name: 'Updated Name',
      };

      const result = updateClientSchema.safeParse(noIdUpdate);

      expect(result.success).toBe(false);
      if (result.success) throw new Error('Validation should failed');

      // Sprawdzamy, czy błąd dotyczy ID
      expect(result.error.flatten().fieldErrors.id).toBeDefined();
    });

    it('should allow partial updates', () => {
      const partialUpdate = {
        id: 1,
        first_name: 'New Name',
      };

      const result = updateClientSchema.safeParse(partialUpdate);
      expect(result.success).toBe(true);
    });
  });

  // ### Nested structure validation ###
  describe('newClientWithAddressSchema', () => {
    it('should validate nested structure', () => {
      const complexData = {
        client: {
          first_name: 'Firma',
          last_name: 'Polex',
          email: 'biuro@polex.pl',
          is_lead: false,
        },
        address: {
          city: 'Gdańsk',
          postal_code: '80-001',
          street: 'Długa',
          building_number: '50',
          nip: '5261040828',
        },
      };

      const result = newClientWithAddressSchema.safeParse(complexData);
      expect(result.success).toBe(true);
    });

    it('should allow creating client without address', () => {
      const clientOnly = {
        client: {
          first_name: 'Lead',
          last_name: 'Potencjalny',
          email: 'lead@example.com',
          is_lead: true,
        },
        // address is optional
      };

      const result = newClientWithAddressSchema.safeParse(clientOnly);
      expect(result.success).toBe(true);
    });
  });
});
