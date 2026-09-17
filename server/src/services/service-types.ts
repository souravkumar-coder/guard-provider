import type { UserRole } from '@guard-provider/shared';

/**
 * Structural stand-in for the authenticated principal. Keeps service files
 * independent from express while staying compatible with `req.user`.
 */
export interface AuthedUserLike {
  id: string;
  role: UserRole;
  name: string;
}
