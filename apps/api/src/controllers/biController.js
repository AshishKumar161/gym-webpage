import BIService from '../services/analytics/BIService.js';
import { AIService } from '../services/ai/AIService.js';
import CacheManager from '../utils/CacheManager.js';

const CACHE_TTL = 300; // 5 minutes

// Helper to use cache
async function getCached(key, fetchFn) {
  const cached = CacheManager.get(key);
  if (cached) return cached;
  
  const data = await fetchFn();
  CacheManager.set(key, data, CACHE_TTL);
  return data;
}

export const getExecutiveSummary = async (req, res, next) => {
  try {
    const data = await getCached('bi_executive_summary', () => BIService.getExecutiveSummary());
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getRevenueTrends = async (req, res, next) => {
  try {
    const data = await getCached('bi_revenue_trends', () => BIService.getRevenueTrends());
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getMembershipDistribution = async (req, res, next) => {
  try {
    const data = await getCached('bi_membership_dist', () => BIService.getMembershipDistribution());
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getAttendanceAnalytics = async (req, res, next) => {
  try {
    const data = await getCached('bi_attendance_analytics', () => BIService.getAttendanceAnalytics());
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getAIForecast = async (req, res, next) => {
  try {
    // Collect data for AI
    const [exec, rev, mem] = await Promise.all([
      getCached('bi_executive_summary', () => BIService.getExecutiveSummary()),
      getCached('bi_revenue_trends', () => BIService.getRevenueTrends()),
      getCached('bi_membership_dist', () => BIService.getMembershipDistribution())
    ]);

    const data = { executive: exec, revenue: rev, membership: mem };
    
    const aiService = new AIService();
    const insights = await aiService.getAdminInsights(req.user.id, data);
    
    res.json({ success: true, data: { insights } });
  } catch (error) {
    next(error);
  }
};

export default {
  getExecutiveSummary,
  getRevenueTrends,
  getMembershipDistribution,
  getAttendanceAnalytics,
  getAIForecast
};
