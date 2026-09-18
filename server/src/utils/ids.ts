import { randomUUID } from 'node:crypto';

/** Generates a prefixed, URL-safe entity id, e.g. `usr_a1b2c3d4`. */
export function createId(prefix: string): string {
  return `${prefix}_${randomUUID().replace(/-/g, '').slice(0, 12)}`;
}
