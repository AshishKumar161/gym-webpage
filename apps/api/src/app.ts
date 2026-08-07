import express, { Express, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { globalErrorHandler } from './middlewares/errorHandler.js';
import authRoutes from './routes/auth.routes.js';

export const app: Express = express();

// 1. Global Middlewares
app.use(helmet());
app.use(compression());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

import planRoutes from './routes/plan.route.js';
import memberRoutes from './routes/member.route.js';

// 2. Core Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/plans', planRoutes);
app.use('/api/v1/members', memberRoutes);

// TODO: Mount legacy feature routes after migrating controllers to Prisma
// import legacyRoutes from './routes/api/v1/index.js';
// app.use('/api/v1', legacyRoutes);

// TODO: Mount legacy feature routes after migrating controllers to Prisma
// import legacyRoutes from './routes/api/v1/index.js';
// app.use('/api/v1', legacyRoutes);

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// 3. Fallback Route
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// 4. Global Error Handler
app.use(globalErrorHandler);
