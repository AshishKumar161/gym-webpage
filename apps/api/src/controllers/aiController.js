import { AIService } from '../services/ai/AIService.js';

const aiService = new AIService();

export const generateWorkout = async (req, res, next) => {
  try {
    const { age, gender, weight, goal, experience } = req.body;
    const profile = { age, gender, weight, goal, experience };
    
    const result = await aiService.generateWorkout(req.user.id, profile);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const generateDiet = async (req, res, next) => {
  try {
    const { goal, diet, calories } = req.body;
    const profile = { goal, diet, calories };
    
    const result = await aiService.generateDiet(req.user.id, profile);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const chat = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }
    
    const result = await aiService.chat(req.user.id, message);
    res.status(200).json({ success: true, data: { text: result } });
  } catch (err) {
    next(err);
  }
};

export const adminInsights = async (req, res, next) => {
  try {
    // Mocking some system data for the AI to analyze since this is just an example
    const data = {
      totalMembers: 1250,
      activeMemberships: 850,
      churnRate: '12%',
      monthlyRevenue: 45000,
      peakHours: '17:00 - 19:00',
    };
    
    const result = await aiService.getAdminInsights(req.user.id, data);
    res.status(200).json({ success: true, data: { text: result } });
  } catch (err) {
    next(err);
  }
};
