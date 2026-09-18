import { config as loadDotenv } from 'dotenv';
import { resolve } from 'node:path';

// Load `server/.env` first, then fall back to the repo-root `.env`.
loadDotenv();
loadDotenv({ path: resolve(process.cwd(), '../.env') });

const env = (key: string, fallback = ''): string => process.env[key] ?? fallback;

export const config = {
  port: Number(env('PORT', '4000')),
  nodeEnv: env('NODE_ENV', 'development'),
  isProd: env('NODE_ENV') === 'production',
  jwtSecret: env('JWT_SECRET', 'insecure-dev-secret-do-not-use-in-production'),
  jwtExpiresIn: env('JWT_EXPIRES_IN', '7d'),
  bcryptRounds: Number(env('BCRYPT_ROUNDS', '10')),
  clientOrigins: env('CLIENT_ORIGIN', 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  dataSource: env('DATA_SOURCE', 'memory'),
  seedDemoData: env('SEED_DEMO_DATA', 'true') !== 'false',
} as const;

if (!process.env.JWT_SECRET) {
  console.warn(
    '[guard-provider] JWT_SECRET is not set — falling back to an insecure development secret. Set it in `.env` before deploying.',
  );
}
