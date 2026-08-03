import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import connectDB from './src/config/db.js';
import logger from './src/utils/logger.js';
import { configureSecurityMiddlewares } from './src/middlewares/securityMiddleware.js';
import { globalLimiter } from './src/middlewares/rateLimiter.js';
import { notFound, errorHandler } from './src/middlewares/errorMiddleware.js';
import apiV1Routes from './src/routes/api/v1/index.js';
import authRoutes from './src/routes/api/v1/authRoutes.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB (non-blocking connection attempt in dev/test)
connectDB();

const app = express();

// Security Middlewares (Helmet, CORS with credentials, Mongo Sanitize)
configureSecurityMiddlewares(app);

// Global Rate Limiting
app.use('/api', globalLimiter);

// Body Parsers & Cookie Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Morgan HTTP Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date()
  });
});

// Direct Auth routes mounting for spec compliance (/auth/* and /api/auth/*)
app.use('/auth', authRoutes);
app.use('/api/auth', authRoutes);

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

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    logger.error(`Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
  });
}

export default app;
