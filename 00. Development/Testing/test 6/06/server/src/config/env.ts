import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000'),
  MONGODB_URI: z.string().default('mongodb://127.0.0.1:27017/applytrack'),
  JWT_SECRET: z.string().default('applytrack-jwt-secret-key-2026'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  GEMINI_API_KEY: z.string().optional(),
});

export const env = envSchema.parse(process.env);
