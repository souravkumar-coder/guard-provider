import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../utils/errors.js';
import { config } from '../config.js';

/** JSON 404 for any unmatched /api route. */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: { code: 'NOT_FOUND', message: `No route matches ${req.method} ${req.originalUrl}` },
  });
}

/** Central error normaliser — every thrown error becomes a predictable JSON body. */
export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof ApiError) {
    res.status(error.status).json({
      error: { code: error.code, message: error.message, details: error.details },
    });
    return;
  }
  if (error instanceof ZodError) {
    res.status(422).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Please check the submitted values',
        details: error.flatten(),
      },
    });
    return;
  }
  console.error('[api] unhandled error:', error);
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: config.isProd
        ? 'Something went wrong on our side. Please try again.'
        : String((error as Error)?.message ?? error),
    },
  });
}
