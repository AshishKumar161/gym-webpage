import express from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
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

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/memberships', membershipRoutes);
router.use('/inquiries', inquiryRoutes);
router.use('/admin', adminRoutes);
router.use('/workouts', workoutRoutes);
router.use('/diets', dietRoutes);
router.use('/classes', classRoutes);
router.use('/payments', paymentRoutes);
router.use('/blogs', blogRoutes);
router.use('/coupons', couponRoutes);
router.use('/notifications', notificationRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/ai', aiRoutes);

export default router;
