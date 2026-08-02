import express from 'express';
import { getClasses, createClass, bookClass, deleteClass } from '../../../controllers/classController.js';
import { protect, authorize } from '../../../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getClasses);
router.post('/', protect, authorize('admin', 'trainer'), createClass);
router.post('/:id/book', protect, bookClass);
router.delete('/:id', protect, authorize('admin', 'trainer'), deleteClass);

export default router;
