import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import { initCronJobs } from './services/cron.js';

// Import Routes
import authRoutes from './routes/auth.routes.js';
import applicationRoutes from './routes/application.routes.js';
import companyRoutes from './routes/company.routes.js';
import interviewRoutes from './routes/interview.routes.js';
import reminderRoutes from './routes/reminder.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import aiRoutes from './routes/ai.routes.js';
import emailRoutes from './routes/email.routes.js';

// Connect Database
connectDB();

// Init Express App
const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors({
  origin: '*', // For development, allow all. Customize in production.
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate Limiting (100 requests per 15 minutes per IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
    error: 'RATE_LIMIT_EXCEEDED',
  },
});
app.use('/api', limiter);

// Request Parsing & Compression
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// Logging
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, status: 'healthy', env: env.NODE_ENV });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/email', emailRoutes);

// Init Background Cron Schedules
initCronJobs();

// 404 Route handler
app.use((req, res, next) => {
  res.status(404);
  const error = new Error(`Route Not Found - ${req.originalUrl}`);
  next(error);
});

// Error handling middleware
app.use(errorHandler);

// Listen
const PORT = env.PORT;
app.listen(PORT, () => {
  console.log(`🚀 ApplyTrack AI Server running in ${env.NODE_ENV} mode on port ${PORT}`);
});

export default app;
