import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { env } from './config/env';
import { connectDB } from './config/db';
import { errorHandler } from './middleware/errorHandler';
import { initCronJobs } from './services/cron';

// Route Handlers
import authRoutes from './routes/auth.routes';
import applicationRoutes from './routes/application.routes';
import companyRoutes from './routes/company.routes';
import interviewRoutes from './routes/interview.routes';
import reminderRoutes from './routes/reminder.routes';
import analyticsRoutes from './routes/analytics.routes';
import aiRoutes from './routes/ai.routes';
import emailRoutes from './routes/email.routes';

const app: Application = express();

// Database Connection
connectDB();

// Init Background Cron Daemon
initCronJobs();

// Security and Performance Middlewares
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));

app.use(cors({
  origin: '*',
  credentials: true,
}));

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Too many API requests, please try again later.',
});
app.use('/api', limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Healthcheck Route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV
  });
});

// REST Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/email', emailRoutes);

// Global Error Handler
app.use(errorHandler);

const PORT = env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 ApplyTrack AI Server running on port ${PORT} [${env.NODE_ENV}]`);
  });
}

export default app;