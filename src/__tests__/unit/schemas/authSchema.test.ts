import { loginSchema } from '@/lib/schemas/authSchema';

describe('Auth Schema (Unit)', () => {
  describe('Login Schema', () => {
    // ### Valid case ###
    it('should validate correct email and password', () => {
      const validData = {
        email: 'example@domain.com',
        password: 'password',
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    // ### Email validation ###
    it('should fail when email is empty', () => {
      const invalidData = {
        email: '',
        password: 'password',
      };

      const result = loginSchema.safeParse(invalidData);
      if (result.success) {
        throw new Error('Validation should failed');
      }

      expect(result.error.flatten().fieldErrors.email).toContain('Adres e-mail jest wymagany.');
    });

    it('should fail when email is incorrect', () => {
      const invalidData = {
        email: 'notaemail',
        password: 'password',
      };

      const result = loginSchema.safeParse(invalidData);
      if (result.success) {
        throw new Error('Validation should failed');
      }

      expect(result.error.flatten().fieldErrors.email).toContain(
        'Niepoprawny format adresu e-mail.',
      );
    });

    // ### Password validation ###
    it('should fail when password is empty', () => {
      const invalidData = {
        email: 'example@domain.com',
        password: '',
      };

      const result = loginSchema.safeParse(invalidData);
      if (result.success) {
        throw new Error('Validation should failed');
      }

      expect(result.error.flatten().fieldErrors.password).toContain('Hasło jest wymagane.');
    });

    // ### Combined validation ###
    it('should report multiple errors if both fields are empty', () => {
      const invalidData = {
        email: '',
        password: '',
      };

      const result = loginSchema.safeParse(invalidData);
      if (result.success) {
        throw new Error('Validation should failed');
      }

      const errors = result.error.flatten().fieldErrors;
      expect(errors.email).toContain('Adres e-mail jest wymagany.');
      expect(errors.password).toContain('Hasło jest wymagane.');
    });
  });
});
