import { config } from './config.js';
import { dataSource } from './data/index.js';
import { seedDemoData } from './data/seed.js';
import { createApp } from './app.js';

async function main(): Promise<void> {
  if (config.seedDemoData && (await dataSource.isEmpty())) {
    console.log('[api] data store is empty — seeding demo data…');
    await seedDemoData(dataSource);
    console.log('[api] demo data ready (demo accounts use password: Password123!)');
  }

  const app = createApp();
  const server = app.listen(config.port, () => {
    console.log(
      `[api] Guard Provider API listening on http://localhost:${config.port} (data source: ${dataSource.kind})`,
    );
  });

  const shutdown = (signal: string): void => {
    console.log(`[api] ${signal} received — shutting down…`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 5000).unref();
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((error) => {
  console.error('[api] fatal startup error:', error);
  process.exit(1);
});
