import express from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import memberRoutes from './memberRoutes.js';
import trainerRoutes from './trainerRoutes.js';
import membershipRoutes from './membershipRoutes.js';
import inquiryRoutes from './inquiryRoutes.js';
import adminRoutes from './adminRoutes.js';
import workoutRoutes from './workoutRoutes.js';
import dietRoutes from './dietRoutes.js';
import classRoutes from './classRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import blogRoutes from './blogRoutes.js';
import couponRoutes from './couponRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import attendanceRoutes from './attendanceRoutes.js';
import aiRoutes from './aiRoutes.js';
import communicationRoutes from './communicationRoutes.js';
import biRoutes from './biRoutes.js';
import inventoryRoutes from './inventoryRoutes.js';
import posRoutes from './posRoutes.js';
import assetRoutes from './assetRoutes.js';
import supplierRoutes from './supplierRoutes.js';
import { getHealth } from '../../../controllers/healthController.js';

const router = express.Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: System Health Status Check
 *     tags:
 *       - Health Check
 *     responses:
 *       200:
 *         description: API system and database operational
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: 'string', example: 'OK' }
 *                 uptime: { type: 'number', example: 124.5 }
 *                 timestamp: { type: 'string', example: '2026-08-03T21:30:00.000Z' }
 * /api/v1/health:
 *   get:
 *     summary: Version 1 API Health Check
 *     tags:
 *       - Health Check
 *     responses:
 *       200:
 *         description: API v1 healthy
 */
router.get('/health', getHealth);

// ─── Auth (Public + Protected) ────────────────────────────────────────────────
router.use('/auth', authRoutes);

// ─── Role-Based Namespaced Routes (Backend enforces RBAC) ────────────────────
router.use('/admin', adminRoutes);           // admin only
router.use('/trainer', trainerRoutes);       // trainer + admin
router.use('/member', memberRoutes);         // member + trainer + admin

// ─── Shared Resources ─────────────────────────────────────────────────────────
router.use('/users', userRoutes);
router.use('/memberships', membershipRoutes);
router.use('/inquiries', inquiryRoutes);
router.use('/workouts', workoutRoutes);
router.use('/diets', dietRoutes);
router.use('/classes', classRoutes);
router.use('/payments', paymentRoutes);
router.use('/blogs', blogRoutes);
router.use('/coupons', couponRoutes);
router.use('/notifications', notificationRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/ai', aiRoutes);
router.use('/communication', communicationRoutes);
router.use('/bi', biRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/pos', posRoutes);
router.use('/assets', assetRoutes);
router.use('/suppliers', supplierRoutes);

export default router;
