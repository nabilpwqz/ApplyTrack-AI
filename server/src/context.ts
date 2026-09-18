import { PrismaClient, User } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { prisma } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'applytrack_ai_super_secret_jwt_key_2026_dev';

export interface GraphQLContext {
  prisma: PrismaClient;
  user: User | null;
  request: {
    id: string;
    auth: {
      scheme?: string;
      provided: boolean;
      valid: boolean;
      token?: string;
    };
    meta: {
      ip?: string;
      userAgent?: string;
      origin?: string;
      platform?: string;
      isBrowser: boolean;
    };
  };
  runtime: {
    bootedAt: number;
    environment: string;
    caller: 'graphql' | 'rest' | 'unknown';
  };
}

interface ResolvedToken {
  scheme?: string;
  token?: string;
  valid: boolean;
}

function buildRequestMetadata(req: any) {
  const forwardedFor = req?.headers?.['x-forwarded-for'];
  const realIp = req?.headers?.['x-real-ip'];
  const userAgent = req?.headers?.['user-agent'];
  const origin = req?.headers?.origin || req?.headers?.referer;

  return {
    ip: Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor || realIp || undefined,
    userAgent: typeof userAgent === 'string' ? userAgent : undefined,
    origin: typeof origin === 'string' ? origin : undefined,
    platform: req?.headers?.['x-platform'] || 'unknown',
    isBrowser: Boolean(req?.headers?.['user-agent'] || req?.headers?.origin),
  };
}

function resolveAuthorizationToken(value: unknown): ResolvedToken {
  if (typeof value !== 'string') {
    return { valid: false };
  }

  if (value.startsWith('Bearer ')) {
    const token = value.substring(7).trim();
    return {
      scheme: 'Bearer',
      token,
      valid: Boolean(token),
    };
  }

  if (value.startsWith('Token ')) {
    const token = value.substring(6).trim();
    return {
      scheme: 'Token',
      token,
      valid: Boolean(token),
    };
  }

  return {
    scheme: 'Unknown',
    valid: false,
  };
}

export async function createContext({ req }: { req: any }): Promise<GraphQLContext> {
  const requestId =
    (req?.headers?.['x-request-id'] as string | undefined) ||
    `graphql-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  const authHeader = req?.headers?.authorization;
  const tokenResolution = resolveAuthorizationToken(authHeader);

  let user: User | null = null;
  if (tokenResolution.valid && tokenResolution.token) {
    try {
      const decoded = jwt.verify(tokenResolution.token, JWT_SECRET) as { userId?: string };
      if (decoded?.userId) {
        user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user) {
          tokenResolution.valid = false;
        }
      }
    } catch {
      tokenResolution.valid = false;
    }
  }

  return {
    prisma,
    user,
    request: {
      id: requestId,
      auth: {
        scheme: tokenResolution.scheme,
        provided: Boolean(authHeader),
        valid: tokenResolution.valid,
        token: tokenResolution.valid ? tokenResolution.token : undefined,
      },
      meta: buildRequestMetadata(req),
    },
    runtime: {
      bootedAt: Date.now(),
      environment: process.env.NODE_ENV || 'development',
      caller: 'graphql',
    },
  };
}
