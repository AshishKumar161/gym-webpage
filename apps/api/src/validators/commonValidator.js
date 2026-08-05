import { z } from 'zod';
import { ValidationError } from '../errors/AppError.js';

export const uuidParamSchema = z.object({
  id: z.string().uuid('Invalid ID format. Must be a valid UUID')
});

export const paginationQuerySchema = z.object({
  page: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 1)),
  limit: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 10))
});

export const membershipSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  price: z.number().min(0, 'Price must be a positive number'),
  durationMonths: z.number().int().min(1, 'Duration must be at least 1 month'),
  description: z.string().optional(),
  features: z.array(z.string()).optional()
});

export const inquirySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required').optional().or(z.literal('')),
  phone: z.string().min(1, 'Phone number is required'),
  subject: z.string().optional(),
  message: z.string().optional()
});

export const updateInquiryStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONTACTED', 'RESOLVED', 'CLOSED'])
});
