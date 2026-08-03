import prisma from '../config/prisma.js';
import { sendResponse } from '../utils/responseFormatter.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getHealth = asyncHandler(async (req, res) => {
  let dbStatus = 'DISCONNECTED';
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'CONNECTED';
  } catch {
    dbStatus = 'DISCONNECTED';
  }

  const memoryUsage = process.memoryUsage();

  const healthData = {
    status: 'healthy',
    application: 'ONLINE',
    database: dbStatus,
    version: process.env.npm_package_version || '1.0.0',
    uptime: Math.floor(process.uptime()),
    memory: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`
    }
  };

  return sendResponse(res, 200, 'Health check status retrieved successfully.', healthData, {
    status: 'healthy',
    database: dbStatus,
    version: '1.0.0',
    uptime: Math.floor(process.uptime())
  });
});

