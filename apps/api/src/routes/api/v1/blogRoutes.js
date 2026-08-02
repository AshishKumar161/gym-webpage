import express from 'express';
import { getBlogs, createBlog, deleteBlog } from '../../../controllers/blogController.js';
import { protect, authorize } from '../../../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getBlogs);
router.post('/', protect, authorize('admin'), createBlog);
router.delete('/:id', protect, authorize('admin'), deleteBlog);

export default router;
