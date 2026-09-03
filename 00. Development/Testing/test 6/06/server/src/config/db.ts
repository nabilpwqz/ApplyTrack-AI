import mongoose from 'mongoose';
import { env } from './env.js';

export let isMongoConnected = false;

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    isMongoConnected = true;
    console.log(`📡 MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    isMongoConnected = false;
    console.warn(`⚠️ MongoDB connection unavailable (${error.message}). Running in Standalone API Mode.`);
  }
};
