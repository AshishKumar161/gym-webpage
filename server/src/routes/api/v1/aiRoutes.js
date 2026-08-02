import express from 'express';
import { generateAIWorkout, generateAIDiet, predictProgress, aiChat } from '../../../controllers/aiController.js';

const router = express.Router();

router.post('/generate-workout', generateAIWorkout);
router.post('/generate-diet', generateAIDiet);
router.post('/predict-progress', predictProgress);
router.post('/chat', aiChat);

export default router;
