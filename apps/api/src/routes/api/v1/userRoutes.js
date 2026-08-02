import express from 'express';
import { getMe, updateProfile, uploadAvatar } from '../../../controllers/userController.js';
import { protect } from '../../../middlewares/authMiddleware.js';
import { uploadSingleImage } from '../../../middlewares/uploadMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/me', getMe);
router.put('/me', updateProfile);
router.post('/me/avatar', uploadSingleImage, uploadAvatar);

export default router;
