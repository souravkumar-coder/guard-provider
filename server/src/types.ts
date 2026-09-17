import type { UserRole } from '@guard-provider/shared';

/** Minimal authenticated principal attached to requests by `requireAuth`. */
export interface AuthedUser {
  id: string;
  role: UserRole;
  name: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthedUser;
    }
  }
}
