import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

interface PrismaRuntimeState {
  connected: boolean;
  lastCheckAt: number;
  lastError?: string;
}

const runtimeState: PrismaRuntimeState = {
  connected: false,
  lastCheckAt: 0,
};

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export async function bootstrapDatabase(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    runtimeState.connected = true;
    runtimeState.lastCheckAt = Date.now();
    runtimeState.lastError = undefined;
    return true;
  } catch (error) {
    runtimeState.connected = false;
    runtimeState.lastCheckAt = Date.now();
    runtimeState.lastError = error instanceof Error ? error.message : 'Unknown Prisma bootstrap error';
    return false;
  }
}

export function getPrismaRuntimeState(): PrismaRuntimeState {
  return { ...runtimeState };
}

export const prismaRuntime = {
  state: runtimeState,
  bootstrap: bootstrapDatabase,
  health: getPrismaRuntimeState,
};
