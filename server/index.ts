import { createApp } from './app';
import { bootstrapDatabase } from './db';

const PORT = parseInt(process.env.PORT || '4000', 10);

interface StartupRuntime {
  phase: 'bootstrapping' | 'starting' | 'ready';
  startedAt: number;
  port: number;
}

async function bootServer(): Promise<StartupRuntime & { app: Awaited<ReturnType<typeof createApp>> }> {
  const startedAt = Date.now();
  const phase: StartupRuntime['phase'] = 'bootstrapping';

  const app = await createApp();
  const databaseReady = await bootstrapDatabase();

  if (!databaseReady) {
    console.warn('[startup] Prisma was not ready at bootstrap time. The app will continue in degraded mode.');
  }

  return {
    phase,
    startedAt,
    port: PORT,
    app,
  };
}

async function startServer() {
  const runtime = await bootServer();
  const listener = runtime.app.listen(PORT, () => {
    console.log(`🚀 ApplyTrack AI Studio GraphQL Server ready at http://localhost:${PORT}/graphql`);
    console.log(`📡 Health check available at http://localhost:${PORT}/api/health`);
    console.log(`📂 Data Export available at http://localhost:${PORT}/api/export/json`);
    console.log(`[startup] boot completed in ${Date.now() - runtime.startedAt}ms`);
  });

  const shutdown = () => {
    console.info('[shutdown] Gracefully draining server process...');
    listener.close(() => process.exit(0));
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer().catch((err) => {
  console.error('❌ Failed to launch ApplyTrack AI Server:', err);
  process.exit(1);
});
