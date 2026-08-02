import mongoose from 'mongoose';
import logger from '../utils/logger.js';

const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/a2revampgym';
    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 5000 // 5 second timeout
    });
    logger.info(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    logger.error(`MongoDB Connection Warning: ${error.message}`);
    logger.warn(`Please ensure MongoDB is running locally (mongod) or set MONGODB_URI in server/.env`);
  }
};

export default connectDB;
