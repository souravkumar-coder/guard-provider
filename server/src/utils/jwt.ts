import jwt from 'jsonwebtoken';
import type { UserRole } from '@guard-provider/shared';
import { config } from '../config.js';
import { ApiError } from './errors.js';

export interface TokenPayload {
  sub: string;
  role: UserRole;
  name: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  } as jwt.SignOptions);
}

export function verifyToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, config.jwtSecret) as TokenPayload;
  } catch {
    throw ApiError.unauthorized('Session expired or invalid — please sign in again');
  }
}
