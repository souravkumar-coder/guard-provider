import type { Request } from 'express';
import type { UserRole } from '@guard-provider/shared';
import { ApiError, asyncHandler } from '../utils/errors.js';
import { verifyToken } from '../utils/jwt.js';
import type { AuthedUser } from '../types.js';

/** Extracts and verifies the Bearer token, attaching `req.user`. */
export const requireAuth = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw ApiError.unauthorized();
  }
  const payload = verifyToken(header.slice('Bearer '.length).trim());
  req.user = { id: payload.sub, role: payload.role, name: payload.name };
  next();
});

/** Restricts a route to the given roles (omit arguments to allow any role). */
export function requireRole(...roles: UserRole[]) {
  return asyncHandler(async (req, _res, next) => {
    if (!req.user) throw ApiError.unauthorized();
    if (roles.length > 0 && !roles.includes(req.user.role)) {
      throw ApiError.forbidden('Your account does not have access to this resource');
    }
    next();
  });
}

/** Non-null assertion helper for handlers that run after `requireAuth`. */
export function auth(req: Request): AuthedUser {
  if (!req.user) throw ApiError.unauthorized();
  return req.user;
}
