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
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not defined in .env.');
    logger.error('[DATABASE] DATABASE_URL environment variable is missing.');
    process.exit(1);
  }

  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    logger.info('[DATABASE] Connected to Neon PostgreSQL');
    console.log('✓ Connected to Neon PostgreSQL');
  } catch (error) {
    console.error('❌ Prisma Error connecting to Neon PostgreSQL:', error);
    logger.error(`[DATABASE] Neon PostgreSQL connection failed: ${error.message}`);
    process.exit(1);
  }
};


export default prisma;
