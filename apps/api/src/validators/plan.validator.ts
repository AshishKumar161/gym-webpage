import { z } from 'zod';

export const createPlanValidator = z.object({
  body: z.object({
    name: z.string().min(2).max(100).trim(),
    description: z.string().max(500).optional(),
    duration: z.enum(['MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY', 'CUSTOM']),
    durationInDays: z.number().int().positive().max(730),
    price: z.number().positive(),
    discountedPrice: z.number().positive().optional().nullable(),
    features: z.array(z.string().max(200)).max(20).optional(),
    maxFreezes: z.number().int().min(0).max(12).default(1),
    freezeDaysLimit: z.number().int().min(0).max(30).default(7),
    sortOrder: z.number().int().min(0).default(0),
  }).refine((data) => {
    if (data.discountedPrice && data.discountedPrice >= data.price) {
      return false;
    }
    return true;
  }, { message: 'Discounted price must be less than original price', path: ['discountedPrice'] }),
});

export const updatePlanValidator = z.object({
  body: z.object({
    name: z.string().min(2).max(100).trim().optional(),
    description: z.string().max(500).optional().nullable(),
    price: z.number().positive().optional(),
    discountedPrice: z.number().positive().optional().nullable(),
    features: z.array(z.string().max(200)).max(20).optional(),
    maxFreezes: z.number().int().min(0).max(12).optional(),
    freezeDaysLimit: z.number().int().min(0).max(30).optional(),
    isActive: z.boolean().optional(),
    sortOrder: z.number().int().min(0).optional(),
  }),
});

export const planIdParamValidator = z.object({
  params: z.object({
    planId: z.string().uuid('Invalid plan ID'),
  }),
});
