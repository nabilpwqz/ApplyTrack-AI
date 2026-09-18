import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createHandler } from 'graphql-http/lib/use/express';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { env } from './config/env';
import { connectDB } from './config/db';
import { errorHandler } from './middleware/errorHandler';
import { initCronJobs } from './services/cron';
import { typeDefs } from './graphql/typeDefs';
import { resolvers } from './graphql/resolvers';
// Route Handlers
import authRoutes from './routes/auth.routes';
import applicationRoutes from './routes/application.routes';
import companyRoutes from './routes/company.routes';
import interviewRoutes from './routes/interview.routes';
import reminderRoutes from './routes/reminder.routes';
import analyticsRoutes from './routes/analytics.routes';
import aiRoutes from './routes/ai.routes';
import emailRoutes from './routes/email.routes';
const app = express();
// Database Connection
connectDB();
// Init Background Cron Daemon
initCronJobs();
// Security and Performance Middlewares
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(morgan('dev'));
app.use(cors({
    origin: '*',
    credentials: true,
}));
// Rate limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    message: 'Too many API requests, please try again later.',
});
app.use('/api', limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Executable GraphQL Schema
const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
});
// GraphQL API HTTP Handler
app.all('/graphql', createHandler({ schema }));
// Healthcheck Route
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'online',
        graphql: '/graphql',
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
        console.log(`🚀 ApplyTrack AI GraphQL & REST Server running on port ${PORT} [${env.NODE_ENV}]`);
        console.log(`📡 GraphQL Endpoint: http://localhost:${PORT}/graphql`);
    });
}
export default app;
