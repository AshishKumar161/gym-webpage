import express from 'express';
import { getBlogs, createBlog, deleteBlog } from '../../../controllers/blogController.js';
import { protect, authorize } from '../../../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/v1/blogs:
 *   get:
 *     summary: List public blog posts
 *     tags:
 *       - Blogs & Content
 *     responses:
 *       200:
 *         description: List of blog posts
 *   post:
 *     summary: Create new blog post (Admin only)
 *     tags:
 *       - Blogs & Content
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Blog'
 *     responses:
 *       201:
 *         description: Blog post created
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin required
 */
router.get('/', getBlogs);
router.post('/', protect, authorize('admin'), createBlog);

/**
 * @swagger
 * /api/v1/blogs/{id}:
 *   delete:
 *     summary: Delete blog post (Admin only)
 *     tags:
 *       - Blogs & Content
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog post deleted
 *       404:
 *         description: Blog post not found
 */
router.delete('/:id', protect, authorize('admin'), deleteBlog);

export default router;
