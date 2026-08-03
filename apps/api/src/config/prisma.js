import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger.js';

// Singleton instance of PrismaClient
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error']
});

/**
 * Establishes database connection to Neon PostgreSQL via Prisma.
 * Prints success message when established and handles connection errors gracefully.
 */
export const connectPrisma = async () => {
  try {
    if (!process.env.DATABASE_URL) {
      logger.warn('[DATABASE] DATABASE_URL environment variable is not defined in .env. Skipping active database query check.');
      return;
    }
    await prisma.$connect();
    // Raw query check to confirm active connection
    await prisma.$queryRaw`SELECT 1`;
    logger.info('[DATABASE] Neon PostgreSQL database connected successfully via Prisma.');
    console.log('✅ Neon PostgreSQL database connection established successfully via Prisma!');
  } catch (error) {
    logger.error(`[DATABASE] Neon PostgreSQL connection failed: ${error.message}`);
    logger.warn('[DATABASE] Please check DATABASE_URL in apps/api/.env or ensure Neon PostgreSQL database is reachable.');
  }
};

export default prisma;
