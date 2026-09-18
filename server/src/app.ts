import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { createContext } from './context';
import { exportRouter } from './routes/exportRoutes';
import { resolvers } from './schema/resolvers';
import { typeDefs } from './schema/typeDefs';

dotenv.config();

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const DEFAULT_ALLOWED_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173'];

const requestLoggerPlugin = {
  async requestDidStart() {
    return {
      async didResolveOperation({ request }: { request: { operationName?: string; query?: string } }) {
        const operationName = request.operationName || 'anonymous';
        const normalized = (request.query || '').replace(/\s+/g, ' ').trim();
        console.info(`[graphql] ${operationName} :: ${normalized.slice(0, 120)}${normalized.length > 120 ? '...' : ''}`);
      },
    };
  },
};

function resolveOriginPolicy(origin: string | undefined): { allow: boolean; value: string | true } {
  if (!origin) {
    return { allow: true, value: true };
  }

  const allowedOrigins = [...DEFAULT_ALLOWED_ORIGINS, CLIENT_ORIGIN].filter(Boolean);
  const isExplicitlyAllowed = allowedOrigins.includes(origin) || origin.endsWith('.vercel.app');

  return {
    allow: CLIENT_ORIGIN === '*' || isExplicitlyAllowed,
    value: origin,
  };
}

export async function createApp() {
  const app = express();

  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use((req, _res, next) => {
    const requestId = (req.headers['x-request-id'] as string | undefined) || `req-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    req.headers['x-request-id'] = requestId;
    next();
  });

  app.use(
    cors({
      origin: (origin, callback) => {
        const policy = resolveOriginPolicy(origin);
        if (policy.allow) {
          return callback(null, policy.value);
        }
        return callback(null, origin || true);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-request-id'],
    })
  );

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use((req, _res, next) => {
    req.headers['x-app-layer'] = 'applytrack-server';
    next();
  });

  app.use('/api', exportRouter);

  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: process.env.NODE_ENV !== 'production',
    csrfPrevention: false,
    plugins: [requestLoggerPlugin as any],
    formatError: (formattedError) => {
      console.error('[graphql:error]', formattedError.message);
      return formattedError;
    },
  });

  await apolloServer.start();

  app.use(
    ['/graphql', '/api/graphql'],
    expressMiddleware(apolloServer, {
      context: createContext,
    }) as any
  );

  return app;
}
