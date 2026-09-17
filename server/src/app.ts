import express from 'express';
import type { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { config } from './config.js';
import { buildRoutes } from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Lightweight request log — enough signal for a demo API without a dep. */
function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const startedAt = Date.now();
  res.on('finish', () => {
      console.log(`[api] ${req.method} ${req.originalUrl} → ${res.statusCode} (${Date.now() - startedAt}ms)`);
  });
  next();
}

export function createApp(): Express {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(
    cors({
      origin: config.clientOrigins.includes('*') ? true : config.clientOrigins,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  if (!config.isProd) app.use(requestLogger);

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'guard-provider-api', time: new Date().toISOString() });
  });

  app.use('/api', buildRoutes());

  // In production the built client can be served by this same process
  // (`npm run build` then `npm start`) — single-origin deployment.
  const clientDist = resolve(__dirname, '../../client/dist');
  if (existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.use((req, res, next) => {
      if (req.method === 'GET' && !req.path.startsWith('/api')) {
        res.sendFile(resolve(clientDist, 'index.html'));
        return;
      }
      next();
    });
  }

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
