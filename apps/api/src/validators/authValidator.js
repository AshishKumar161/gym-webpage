import { z } from 'zod';
import { ValidationError } from '../errors/AppError.js';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long').max(50),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number'),
  phone: z.string().optional(),
  avatar: z.string().url().optional().or(z.literal('')),
  role: z.enum(['MEMBER', 'TRAINER', 'ADMIN', 'member', 'trainer', 'admin']).optional()
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

export const validateWithZod = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const formattedErrors = result.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message
    }));
    return next(new ValidationError(formattedErrors[0]?.message || 'Validation failed', formattedErrors));
  }
  req.body = result.data;
  next();
};
