import express from 'express';
import { getMe, updateProfile, uploadAvatar } from '../../../controllers/userController.js';
import { protect } from '../../../middlewares/authMiddleware.js';
import { uploadSingleImage } from '../../../middlewares/uploadMiddleware.js';

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * /api/v1/users/me:
 *   get:
 *     summary: Get Current Logged-in User Info
 *     tags:
 *       - Users & Uploads
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile info retrieved
 *       401:
 *         description: Unauthorized
 *   put:
 *     summary: Update User Profile Details
 *     tags:
 *       - Users & Uploads
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: 'string', example: 'John Updated' }
 *               phone: { type: 'string', example: '+1999888777' }
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */
router.get('/me', getMe);
router.put('/me', updateProfile);

/**
 * @swagger
 * /api/v1/users/me/avatar:
 *   post:
 *     summary: Upload User Avatar Image (Cloudinary)
 *     tags:
 *       - Users & Uploads
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Avatar image file (png/jpeg)
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 *       400:
 *         description: No file uploaded or invalid file format
 *       401:
 *         description: Unauthorized
 */
router.post('/me/avatar', uploadSingleImage, uploadAvatar);

export default router;
