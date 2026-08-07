import { z } from 'zod';

export const createMemberValidator = z.object({
  body: z.object({
    name: z.string().min(2).max(100).trim(),
    email: z.string().email().toLowerCase().trim(),
    phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number'),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
    dateOfBirth: z.string().datetime().optional(),
    bloodGroup: z.enum(['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE']).optional(),
    emergencyContact: z.string().max(15).optional(),
    emergencyName: z.string().max(100).optional(),
    address: z.string().max(500).optional(),
    city: z.string().max(100).optional(),
    state: z.string().max(100).optional(),
    pincode: z.string().regex(/^\d{6}$/).optional(),
    weight: z.number().positive().max(300).optional(),
    height: z.number().positive().max(300).optional(),
    medicalConditions: z.string().max(1000).optional(),
    fitnessGoal: z.string().max(500).optional(),
    source: z.enum(['WALK_IN', 'REFERRAL', 'SOCIAL_MEDIA', 'WEBSITE', 'OTHER']).optional(),
    referredByCode: z.string().optional(), // Referral code of the referrer
    branchId: z.string().uuid().optional(),
    // Membership assignment (optional — can assign later)
    planId: z.string().uuid().optional(),
    startDate: z.string().datetime().optional(),
    paidAmount: z.number().min(0).optional(),
    discountAmount: z.number().min(0).optional(),
  }),
});

export const updateMemberValidator = z.object({
  body: z.object({
    name: z.string().min(2).max(100).trim().optional(),
    phone: z.string().regex(/^[6-9]\d{9}$/).optional(),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional().nullable(),
    dateOfBirth: z.string().datetime().optional().nullable(),
    bloodGroup: z.enum(['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE']).optional().nullable(),
    emergencyContact: z.string().max(15).optional().nullable(),
    emergencyName: z.string().max(100).optional().nullable(),
    address: z.string().max(500).optional().nullable(),
    city: z.string().max(100).optional().nullable(),
    state: z.string().max(100).optional().nullable(),
    pincode: z.string().regex(/^\d{6}$/).optional().nullable(),
    weight: z.number().positive().max(300).optional().nullable(),
    height: z.number().positive().max(300).optional().nullable(),
    medicalConditions: z.string().max(1000).optional().nullable(),
    fitnessGoal: z.string().max(500).optional().nullable(),
  }),
});

export const memberIdParamValidator = z.object({
  params: z.object({
    memberId: z.string().uuid('Invalid member ID'),
  }),
});

export const memberQueryValidator = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    search: z.string().optional(),
    status: z.enum(['ACTIVE', 'EXPIRED', 'FROZEN', 'CANCELLED', 'PENDING', 'ALL']).default('ALL'),
    sortBy: z.enum(['name', 'joinedAt', 'endDate', 'createdAt']).default('createdAt'),
    order: z.enum(['asc', 'desc']).default('desc'),
    branchId: z.string().uuid().optional(),
  }),
});

export const assignPlanValidator = z.object({
  body: z.object({
    planId: z.string().uuid(),
    startDate: z.string().datetime(),
    paidAmount: z.number().min(0),
    discountAmount: z.number().min(0).default(0),
    notes: z.string().max(500).optional(),
  }),
});

export const freezeMembershipValidator = z.object({
  body: z.object({
    freezeDays: z.number().int().positive().max(30),
    reason: z.string().max(500).optional(),
  }),
});

export const renewMembershipValidator = z.object({
  body: z.object({
    planId: z.string().uuid(),
    paidAmount: z.number().min(0),
    discountAmount: z.number().min(0).default(0),
    notes: z.string().max(500).optional(),
  }),
});

export const addNoteValidator = z.object({
  body: z.object({
    content: z.string().min(1).max(2000).trim(),
    isPrivate: z.boolean().default(false),
  }),
});

export const assignTrainerValidator = z.object({
  body: z.object({
    trainerId: z.string().uuid(),
    notes: z.string().max(500).optional(),
  }),
});
