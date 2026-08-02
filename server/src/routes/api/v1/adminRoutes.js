import express from 'express';
import { getAdminAnalytics, getUsers, updateUser, deleteUser } from '../../../controllers/adminController.js';
import { protect, authorize } from '../../../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/analytics', getAdminAnalytics);
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

export default router;
