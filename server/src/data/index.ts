import { config } from '../config.js';
import type { DataSource } from './DataSource.js';
import { MemoryDataSource } from './memory/MemoryDataSource.js';
import { PrismaDataSource } from './prisma/PrismaDataSource.js';

/**
 * Data-source factory. The API only ever depends on the `DataSource`
 * interface, so switching persistence is a one-line change here:
 *   - `memory`   → in-memory demo store (default, zero-config).
 *   - `postgres` → PostgreSQL via Prisma (requires DATABASE_URL).
 */
function createDataSource(kind: string): DataSource {
  switch (kind) {
    case 'memory':
      return new MemoryDataSource();
    case 'postgres':
      return new PrismaDataSource();
    default:
      throw new Error(
        `[guard-provider] Unknown DATA_SOURCE "${kind}". Supported values: memory, postgres. See README for wiring a real database.`,
      );
  }
}

export const dataSource: DataSource = createDataSource(config.dataSource);
