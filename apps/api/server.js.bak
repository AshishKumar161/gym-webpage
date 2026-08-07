import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import compression from 'compression';

import { connectPrisma } from './src/config/prisma.js';
import logger from './src/utils/logger.js';
import { configureSecurityMiddlewares } from './src/middlewares/securityMiddleware.js';
import { globalLimiter } from './src/middlewares/rateLimiter.js';
import { requestIdMiddleware } from './src/middlewares/requestIdMiddleware.js';
import { notFound, errorHandler } from './src/middlewares/errorMiddleware.js';
import { setupSwagger } from './src/docs/swagger.js';
import { getHealth } from './src/controllers/healthController.js';

import apiV1Routes from './src/routes/api/v1/index.js';
import authRoutes from './src/routes/api/v1/authRoutes.js';
import adminRoutes from './src/routes/api/v1/adminRoutes.js';
import trainerRoutes from './src/routes/api/v1/trainerRoutes.js';
import memberRoutes from './src/routes/api/v1/memberRoutes.js';

// Load environment variables
dotenv.config();

// Validate critical environment variables
const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'CLIENT_URL'
];

const missingVars = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
if (missingVars.length > 0) {
  console.error(`❌ Critical Startup Error: Missing required environment variables: ${missingVars.join(', ')}`);
  logger.error(`[SERVER] Missing required environment variables: ${missingVars.join(', ')}`);
  process.exit(1);
}

// Connect to Neon PostgreSQL Database via Prisma
connectPrisma();


const app = express();

// Request ID Generation Middleware
app.use(requestIdMiddleware);

// Security Middlewares (Helmet, CORS with credentials)
configureSecurityMiddlewares(app);

// Global Rate Limiting
app.use('/api', globalLimiter);

// Payload Compression
app.use(compression());

// Body Parsers & Cookie Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Morgan HTTP Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Mount Swagger Documentation
setupSwagger(app);

// Welcome / Root Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🏋️ Welcome to the Gym Management API',
    version: '1.0.0',
    status: 'ONLINE',
    documentation: '/api/docs',
    endpoints: {
      health: '/health',
      healthV1: '/api/v1/health',
      auth: {
        register: 'POST /api/v1/auth/register',
        login: 'POST /api/v1/auth/login',
        me: 'GET /api/v1/auth/me',
        logout: 'POST /api/v1/auth/logout'
      },
      protected: {
        admin: '/admin/*',
        trainer: '/trainer/*',
        member: '/member/*'
      }
    }
  });
});

// Health Check Endpoint
app.get('/health', getHealth);

// Direct Auth & Role-Based Routes Mounting for spec compliance (/auth/*, /admin/*, /trainer/*, /member/*)
app.use('/auth', authRoutes);
app.use('/api/auth', authRoutes);

app.use('/admin', adminRoutes);
app.use('/trainer', trainerRoutes);
app.use('/member', memberRoutes);

// API Routes (Version 1)
app.use('/api/v1', apiV1Routes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });

  // Graceful Shutdown Logic
  const shutdown = async (signal) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      logger.info('HTTP server closed.');
      const { prisma } = await import('./src/config/prisma.js');
      if (prisma) await prisma.$disconnect();
      logger.info('Database connection closed.');
      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    logger.error(`Unhandled Rejection: ${err.message}`);
    shutdown('UNHANDLED_REJECTION');
  });
}

export default app;
