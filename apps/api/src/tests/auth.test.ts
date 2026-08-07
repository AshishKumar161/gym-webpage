import { describe, it, expect } from 'vitest';
import { loginSchema } from '../validators/auth.validator.js';

describe('Auth Validators', () => {
  it('should validate a correct login payload', () => {
    const validPayload = {
      body: {
        email: 'test@a2revampgym.com',
        password: 'password123',
      }
    };
    const result = loginSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it('should reject an invalid email', () => {
    const invalidPayload = {
      body: {
        email: 'not-an-email',
        password: 'password123',
      }
    };
    const result = loginSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
  });
});
