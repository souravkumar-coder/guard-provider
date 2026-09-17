import { config } from '../config.js';
import type { DataSource } from './DataSource.js';
import { MemoryDataSource } from './memory/MemoryDataSource.js';

/**
 * Data-source factory. Adding a real database later means implementing
 * `DataSource` (e.g. `PrismaDataSource`) and registering it here — nothing
 * else in the codebase touches storage directly.
 */
function createDataSource(kind: string): DataSource {
  switch (kind) {
    case 'memory':
      return new MemoryDataSource();
    default:
      throw new Error(
        `[guard-provider] Unknown DATA_SOURCE "${kind}". Supported values: memory. See README for wiring a real database.`,
      );
  }
}

export const dataSource: DataSource = createDataSource(config.dataSource);
