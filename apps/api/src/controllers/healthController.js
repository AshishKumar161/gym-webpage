import prisma from '../config/prisma.js';
import { sendResponse } from '../utils/responseFormatter.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getHealth = asyncHandler(async (req, res) => {
  let dbStatus = 'DISCONNECTED';
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'CONNECTED';
  } catch {
    dbStatus = 'DEGRADED';
  }

  const memoryUsage = process.memoryUsage();

  const healthData = {
    application: 'ONLINE',
    database: dbStatus,
    uptime: process.uptime(),
    memory: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`
    },
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  };

  return sendResponse(res, 200, 'Health check status retrieved successfully.', healthData);
});
